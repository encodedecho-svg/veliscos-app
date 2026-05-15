"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Phone, Mail } from "lucide-react";
import { listOrders } from "@/lib/admin-orders";
import {
  aggregateCustomers,
  customersToCSV,
  type Customer,
  type CustomerSegment,
} from "@/lib/admin-customers";
import { pkr } from "@/lib/format";

const SEGMENT_LABEL: Record<CustomerSegment, string> = {
  vip: "VIP",
  returning: "Returning",
  new: "New",
  "at-risk": "At-Risk",
};

const SEGMENT_COLOR: Record<CustomerSegment, string> = {
  vip: "#b8814a",
  returning: "#3a7a8c",
  new: "#1e7e44",
  "at-risk": "#c47a06",
};

type SortKey = "name" | "orders" | "ltv" | "last";

function download(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [segFilter, setSegFilter] = useState<CustomerSegment | "all">("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("last");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const refresh = useCallback(async () => {
    setLoading(true);
    const orders = await listOrders();
    setCustomers(aggregateCustomers(orders));
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "name" ? "asc" : "desc");
    }
  }

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const start = startDate ? new Date(startDate).getTime() : null;
    const end = endDate ? new Date(endDate).getTime() + 86400000 - 1 : null;

    const filtered = customers.filter((c) => {
      if (segFilter !== "all" && c.segment !== segFilter) return false;
      if (start || end) {
        const t = new Date(c.lastOrderAt).getTime();
        if (start && t < start) return false;
        if (end && t > end) return false;
      }
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
      );
    });

    const sorted = [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "orders":
          cmp = a.orders - b.orders;
          break;
        case "ltv":
          cmp = a.ltv - b.ltv;
          break;
        case "last":
          cmp = new Date(a.lastOrderAt).getTime() - new Date(b.lastOrderAt).getTime();
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return sorted;
  }, [customers, search, segFilter, startDate, endDate, sortKey, sortDir]);

  const counts = useMemo(() => {
    const out: Record<CustomerSegment | "all", number> = {
      all: customers.length,
      vip: 0,
      returning: 0,
      new: 0,
      "at-risk": 0,
    };
    for (const c of customers) out[c.segment]++;
    return out;
  }, [customers]);

  const totalLtv = customers.reduce((s, c) => s + c.ltv, 0);
  const avgLtv = customers.length ? Math.round(totalLtv / customers.length) : 0;

  function sortInd(key: SortKey) {
    if (sortKey !== key) return <span style={{ opacity: 0.3, fontSize: "0.65rem", marginLeft: 4 }}>↕</span>;
    return (
      <span style={{ opacity: 1, color: "#4a90a4", fontSize: "0.65rem", marginLeft: 4 }}>
        {sortDir === "asc" ? "↑" : "↓"}
      </span>
    );
  }

  return (
    <div>
      <div className="admin-header">
        <h2>Customers</h2>
        <button
          className="btn btn-outline"
          onClick={() =>
            download(`veliscos-customers-${Date.now()}.csv`, customersToCSV(visible))
          }
          disabled={visible.length === 0}
        >
          Export CSV
        </button>
      </div>

      <div className="kpi-grid" style={{ marginBottom: 20 }}>
        <div className="kpi-card">
          <div className="kpi-label">Total Customers</div>
          <div className="kpi-value">{customers.length}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Combined LTV</div>
          <div className="kpi-value" style={{ color: "#4a90a4" }}>{pkr(totalLtv)}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Average LTV</div>
          <div className="kpi-value">{pkr(avgLtv)}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">VIP Customers</div>
          <div className="kpi-value" style={{ color: SEGMENT_COLOR.vip }}>{counts.vip}</div>
          <div className="kpi-sub">≥3 orders or LTV ≥ {pkr(10000)}</div>
        </div>
      </div>

      <div className="admin-card" style={{ marginBottom: 16, padding: "16px 20px" }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <span
              style={{
                fontSize: "0.72rem",
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                color: "#999",
                fontWeight: 600,
                marginRight: 4,
              }}
            >
              Segment
            </span>
            <button
              className={`status-chip chip-all ${segFilter === "all" ? "active" : ""}`}
              onClick={() => setSegFilter("all")}
            >
              All <span className="chip-count">{counts.all}</span>
            </button>
            {(["vip", "returning", "new", "at-risk"] as CustomerSegment[]).map((s) => (
              <button
                key={s}
                className={`status-chip ${segFilter === s ? "active" : ""}`}
                style={{ color: SEGMENT_COLOR[s], borderColor: SEGMENT_COLOR[s] }}
                onClick={() => setSegFilter(s)}
              >
                {SEGMENT_LABEL[s]} <span className="chip-count">{counts[s]}</span>
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginLeft: "auto", flexWrap: "wrap" }}>
            <input
              type="date"
              className="form-control"
              style={{ width: 150, padding: "8px 12px" }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span style={{ color: "#999" }}>to</span>
            <input
              type="date"
              className="form-control"
              style={{ width: 150, padding: "8px 12px" }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <button
              className="btn btn-outline"
              style={{ padding: "8px 14px" }}
              onClick={() => {
                setStartDate("");
                setEndDate("");
              }}
            >
              Clear
            </button>
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <input
            type="text"
            className="form-control"
            style={{ maxWidth: 420 }}
            placeholder="Search name, phone, email, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="admin-card" style={{ padding: 0, overflowX: "auto" }}>
        {loading ? (
          <div style={{ padding: 24, color: "#999" }}>Loading customers…</div>
        ) : visible.length === 0 ? (
          <div className="empty-state">
            <h3>No customers match these filters</h3>
            <p>
              Customers are derived from your orders. When orders come in,
              they&apos;ll appear here automatically.
            </p>
          </div>
        ) : (
          <table className="admin-table" style={{ minWidth: 900 }}>
            <thead>
              <tr>
                <th>Segment</th>
                <th onClick={() => toggleSort("name")} style={{ cursor: "pointer" }}>
                  Name {sortInd("name")}
                </th>
                <th>Contact</th>
                <th>City</th>
                <th
                  onClick={() => toggleSort("orders")}
                  style={{ cursor: "pointer", textAlign: "right" }}
                >
                  Orders {sortInd("orders")}
                </th>
                <th
                  onClick={() => toggleSort("ltv")}
                  style={{ cursor: "pointer", textAlign: "right" }}
                >
                  LTV {sortInd("ltv")}
                </th>
                <th onClick={() => toggleSort("last")} style={{ cursor: "pointer" }}>
                  Last Order {sortInd("last")}
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((c) => (
                <tr key={c.key}>
                  <td>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "3px 9px",
                        borderRadius: 8,
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        letterSpacing: "0.5px",
                        textTransform: "uppercase",
                        background: `${SEGMENT_COLOR[c.segment]}22`,
                        color: SEGMENT_COLOR[c.segment],
                      }}
                    >
                      {SEGMENT_LABEL[c.segment]}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <a
                        href={`tel:${c.phone}`}
                        title={c.phone}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "4px 10px",
                          borderRadius: 8,
                          border: "1.5px solid #cfe2f3",
                          color: "#1e88e5",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          textDecoration: "none",
                        }}
                      >
                        <Phone size={12} /> {c.phone}
                      </a>
                      <a
                        href={`mailto:${c.email}`}
                        title={c.email}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "4px 10px",
                          borderRadius: 8,
                          border: "1.5px solid #f4c7c1",
                          color: "#e74c3c",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          textDecoration: "none",
                          maxWidth: 200,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <Mail size={12} /> {c.email}
                      </a>
                    </div>
                  </td>
                  <td>{c.city}</td>
                  <td style={{ textAlign: "right", fontWeight: 600 }}>{c.orders}</td>
                  <td style={{ textAlign: "right", fontWeight: 700, color: "#4a90a4" }}>
                    {pkr(c.ltv)}
                  </td>
                  <td style={{ color: "#666", fontSize: "0.82rem" }}>
                    {new Date(c.lastOrderAt).toLocaleDateString("en-PK")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
