"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import {
  listOrders,
  listOrderItems,
  updateOrderStatus,
  type AdminOrder,
  type AdminOrderItem,
  type OrderStatus,
} from "@/lib/admin-orders";
import { pkr } from "@/lib/format";

const STATUS_OPTIONS: OrderStatus[] = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function buildCSV(orders: AdminOrder[]): string {
  const header = [
    "Order ID",
    "Status",
    "Customer",
    "Email",
    "Phone",
    "Address",
    "City",
    "Zip",
    "Payment",
    "Subtotal",
    "Shipping",
    "Total",
    "Placed At",
    "Notes",
  ];
  const escape = (s: string | number | null | undefined) => {
    const v = String(s ?? "");
    if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
    return v;
  };
  const lines = orders.map((o) =>
    [
      o.id,
      o.status,
      `${o.firstName} ${o.lastName}`,
      o.email,
      o.phone,
      o.address,
      o.city,
      o.zip ?? "",
      o.paymentMethod,
      o.subtotal,
      o.shipping,
      o.total,
      new Date(o.createdAt).toISOString(),
      o.notes ?? "",
    ]
      .map(escape)
      .join(",")
  );
  return [header.join(","), ...lines].join("\n");
}

function downloadCSV(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [itemsCache, setItemsCache] = useState<Record<string, AdminOrderItem[]>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await listOrders();
    setOrders(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function toggleExpand(id: string) {
    if (expanded === id) {
      setExpanded(null);
      return;
    }
    setExpanded(id);
    if (!itemsCache[id]) {
      const items = await listOrderItems(id);
      setItemsCache((c) => ({ ...c, [id]: items }));
    }
  }

  async function changeStatus(id: string, status: OrderStatus) {
    setSavingId(id);
    const { error } = await updateOrderStatus(id, status);
    setSavingId(null);
    if (error) {
      alert(`Could not update: ${error}`);
      return;
    }
    setOrders((o) => o.map((x) => (x.id === id ? { ...x, status } : x)));
  }

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (filter !== "all" && o.status !== filter) return false;
      if (!q) return true;
      return (
        o.id.toLowerCase().includes(q) ||
        `${o.firstName} ${o.lastName}`.toLowerCase().includes(q) ||
        o.phone.toLowerCase().includes(q) ||
        o.city.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q)
      );
    });
  }, [orders, filter, search]);

  const counts = useMemo(() => {
    const out: Record<OrderStatus | "all", number> = {
      all: orders.length,
      pending: 0,
      confirmed: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };
    for (const o of orders) out[o.status]++;
    return out;
  }, [orders]);

  return (
    <div>
      <div className="admin-header">
        <h2>Order Processing</h2>
        <button
          className="btn btn-outline"
          onClick={() => downloadCSV(`veliscos-orders-${Date.now()}.csv`, buildCSV(visible))}
          disabled={visible.length === 0}
        >
          Export CSV
        </button>
      </div>

      <div style={{ marginBottom: 12 }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by ID, name, phone, email, or city..."
          className="form-control"
          style={{ maxWidth: 420 }}
        />
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <button
          className={`status-chip chip-all ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All <span className="chip-count">{counts.all}</span>
        </button>
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            className={`status-chip chip-${s} ${filter === s ? "active" : ""}`}
            onClick={() => setFilter(s)}
          >
            {STATUS_LABEL[s]} <span className="chip-count">{counts[s]}</span>
          </button>
        ))}
      </div>

      <div className="admin-card" style={{ padding: 0, overflowX: "auto" }}>
        {loading ? (
          <div style={{ padding: 24, color: "#999" }}>Loading orders…</div>
        ) : visible.length === 0 ? (
          <div className="empty-state">
            <h3>No orders {filter !== "all" && `with status ${STATUS_LABEL[filter]}`}</h3>
            <p>Storefront orders will appear here as they come in.</p>
          </div>
        ) : (
          <table className="admin-table" style={{ minWidth: 900 }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>City</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {visible.map((o) => {
                const isOpen = expanded === o.id;
                const items = itemsCache[o.id];
                return (
                  <Fragment key={o.id}>
                    <tr>
                      <td style={{ fontFamily: "monospace", fontSize: "0.78rem" }}>
                        {o.id}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>
                          {o.firstName} {o.lastName}
                        </div>
                        <div style={{ fontSize: "0.78rem", color: "#666" }}>
                          {o.email}
                        </div>
                      </td>
                      <td>{o.phone}</td>
                      <td>{o.city}</td>
                      <td style={{ fontWeight: 700 }}>{pkr(o.total)}</td>
                      <td style={{ textTransform: "capitalize" }}>
                        {o.paymentMethod}
                      </td>
                      <td>
                        <select
                          value={o.status}
                          disabled={savingId === o.id}
                          onChange={(e) =>
                            changeStatus(o.id, e.target.value as OrderStatus)
                          }
                          className={`status-badge status-${o.status}`}
                          style={{ border: "none", outline: "none", cursor: "pointer" }}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {STATUS_LABEL[s]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td style={{ color: "#666", fontSize: "0.82rem" }}>
                        {new Date(o.createdAt).toLocaleDateString("en-PK")}
                      </td>
                      <td>
                        <button
                          className="btn btn-outline"
                          style={{ padding: "6px 14px", fontSize: "0.78rem" }}
                          onClick={() => toggleExpand(o.id)}
                        >
                          {isOpen ? "Hide" : "Details"}
                        </button>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className="detail-row">
                        <td colSpan={9}>
                          <div className="detail-grid">
                            <div>
                              <h4>Delivery</h4>
                              <div className="detail-line">
                                {o.address}, {o.city}
                                {o.zip ? ` — ${o.zip}` : ""}
                              </div>
                              <div
                                className="detail-line"
                                style={{ color: "#666", marginTop: 6 }}
                              >
                                {o.email} · {o.phone}
                              </div>
                              {o.notes && (
                                <div
                                  className="detail-line"
                                  style={{
                                    marginTop: 10,
                                    fontStyle: "italic",
                                    color: "#666",
                                  }}
                                >
                                  &ldquo;{o.notes}&rdquo;
                                </div>
                              )}
                              <div
                                className="detail-line"
                                style={{ color: "#999", fontSize: "0.78rem", marginTop: 10 }}
                              >
                                Placed{" "}
                                {new Date(o.createdAt).toLocaleString("en-PK")}
                              </div>
                            </div>
                            <div>
                              <h4>Line Items</h4>
                              {!items ? (
                                <p style={{ color: "#999" }}>Loading…</p>
                              ) : items.length === 0 ? (
                                <p style={{ color: "#999" }}>No items.</p>
                              ) : (
                                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                                  {items.map((it) => (
                                    <li
                                      key={it.id}
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        padding: "6px 0",
                                        fontSize: "0.88rem",
                                      }}
                                    >
                                      <span>
                                        {it.productName}{" "}
                                        <span style={{ color: "#999" }}>
                                          × {it.qty}
                                        </span>
                                      </span>
                                      <span style={{ fontWeight: 600 }}>
                                        {pkr(it.lineTotal)}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                            <div>
                              <h4>Totals</h4>
                              <div
                                className="detail-line"
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                <span>Subtotal</span>
                                <span>{pkr(o.subtotal)}</span>
                              </div>
                              <div
                                className="detail-line"
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                <span>Shipping</span>
                                <span>
                                  {o.shipping === 0 ? "Free" : pkr(o.shipping)}
                                </span>
                              </div>
                              <div
                                className="detail-line"
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  fontWeight: 700,
                                  borderTop: "1px solid #ddd",
                                  paddingTop: 8,
                                  marginTop: 8,
                                }}
                              >
                                <span>Total</span>
                                <span>{pkr(o.total)}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
