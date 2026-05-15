"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import {
  listPartners,
  listPayouts,
  createPartner,
  deletePartner,
  createPayout,
  deletePayout,
  type Partner,
  type Payout,
} from "@/lib/admin-partners";
import { listOrders } from "@/lib/admin-orders";
import { pkr } from "@/lib/format";

const COLORS = ["#4a90a4", "#d4a373", "#27ae60", "#8e24aa", "#1e88e5", "#ff8f00"];

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [revenue, setRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  const [showPartnerForm, setShowPartnerForm] = useState(false);
  const [partnerDraft, setPartnerDraft] = useState({
    name: "",
    contact: "",
    sharePercent: 0,
    notes: "",
  });
  const [savingPartner, setSavingPartner] = useState(false);

  const [showPayoutForm, setShowPayoutForm] = useState(false);
  const [payoutDraft, setPayoutDraft] = useState({
    partnerId: 0,
    amount: 0,
    paidAt: new Date().toISOString().slice(0, 10),
    notes: "",
  });
  const [savingPayout, setSavingPayout] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [p, py, orders] = await Promise.all([
      listPartners(),
      listPayouts(),
      listOrders(),
    ]);
    setPartners(p);
    setPayouts(py);
    setRevenue(
      orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.total, 0)
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function addPartner() {
    if (!partnerDraft.name.trim() || partnerDraft.sharePercent <= 0) {
      alert("Name and share % required.");
      return;
    }
    setSavingPartner(true);
    const { error } = await createPartner(partnerDraft);
    setSavingPartner(false);
    if (error) {
      alert(error);
      return;
    }
    setShowPartnerForm(false);
    setPartnerDraft({ name: "", contact: "", sharePercent: 0, notes: "" });
    refresh();
  }

  async function removePartner(p: Partner) {
    if (!confirm(`Delete partner ${p.name}? This also deletes their payout history.`)) return;
    const { error } = await deletePartner(p.id);
    if (error) {
      alert(error);
      return;
    }
    refresh();
  }

  async function addPayout() {
    if (!payoutDraft.partnerId || payoutDraft.amount <= 0) {
      alert("Partner and amount required.");
      return;
    }
    setSavingPayout(true);
    const { error } = await createPayout(payoutDraft);
    setSavingPayout(false);
    if (error) {
      alert(error);
      return;
    }
    setShowPayoutForm(false);
    setPayoutDraft({
      partnerId: 0,
      amount: 0,
      paidAt: new Date().toISOString().slice(0, 10),
      notes: "",
    });
    refresh();
  }

  async function removePayout(p: Payout) {
    if (!confirm("Delete this payout record?")) return;
    const { error } = await deletePayout(p.id);
    if (error) {
      alert(error);
      return;
    }
    setPayouts((py) => py.filter((x) => x.id !== p.id));
  }

  const shareTotal = useMemo(
    () => partners.reduce((s, p) => s + p.sharePercent, 0),
    [partners]
  );

  const partnerSummary = useMemo(() => {
    return partners.map((p) => {
      const earned = Math.round((revenue * p.sharePercent) / 100);
      const paid = payouts
        .filter((py) => py.partnerId === p.id)
        .reduce((s, py) => s + py.amount, 0);
      return {
        ...p,
        earned,
        paid,
        outstanding: Math.max(0, earned - paid),
      };
    });
  }, [partners, payouts, revenue]);

  const partnerById = new Map(partners.map((p) => [p.id, p]));

  return (
    <div>
      <div className="admin-header">
        <h2>Partner Settlements</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-outline" onClick={() => setShowPayoutForm((s) => !s)}>
            {showPayoutForm ? "Cancel" : "+ Record Payout"}
          </button>
          <button className="btn btn-primary" onClick={() => setShowPartnerForm((s) => !s)}>
            {showPartnerForm ? "Cancel" : "+ Add Partner"}
          </button>
        </div>
      </div>

      <div className="kpi-grid" style={{ marginBottom: 20 }}>
        <div className="kpi-card">
          <div className="kpi-label">Revenue (all-time)</div>
          <div className="kpi-value" style={{ color: "#4a90a4" }}>{pkr(revenue)}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Total Earned (partners)</div>
          <div className="kpi-value">
            {pkr(partnerSummary.reduce((s, p) => s + p.earned, 0))}
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Total Paid Out</div>
          <div className="kpi-value" style={{ color: "#27ae60" }}>
            {pkr(partnerSummary.reduce((s, p) => s + p.paid, 0))}
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Outstanding</div>
          <div
            className="kpi-value"
            style={{
              color:
                partnerSummary.reduce((s, p) => s + p.outstanding, 0) > 0
                  ? "#e74c3c"
                  : "#1a1a2e",
            }}
          >
            {pkr(partnerSummary.reduce((s, p) => s + p.outstanding, 0))}
          </div>
        </div>
      </div>

      {shareTotal !== 100 && partners.length > 0 && (
        <div
          className="admin-card"
          style={{
            background: "#fff8e1",
            borderColor: "#ffe082",
            padding: "12px 16px",
            marginBottom: 20,
          }}
        >
          <p style={{ fontSize: "0.85rem", margin: 0 }}>
            <strong>Heads up:</strong> partner shares total {shareTotal}%, not 100%.
            Adjust shares so totals reconcile.
          </p>
        </div>
      )}

      {partners.length > 0 && (
        <div className="admin-card">
          <h3 style={{ marginBottom: 14 }}>Share Allocation</h3>
          <div
            style={{
              display: "flex",
              height: 28,
              borderRadius: 8,
              overflow: "hidden",
              background: "#f0f0f0",
            }}
          >
            {partners.map((p, i) => (
              <div
                key={p.id}
                title={`${p.name}: ${p.sharePercent}%`}
                style={{
                  width: `${p.sharePercent}%`,
                  background: COLORS[i % COLORS.length],
                }}
              />
            ))}
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 14,
              marginTop: 12,
              fontSize: "0.82rem",
            }}
          >
            {partners.map((p, i) => (
              <span key={p.id} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span
                  style={{
                    display: "inline-block",
                    width: 10,
                    height: 10,
                    background: COLORS[i % COLORS.length],
                    borderRadius: 2,
                  }}
                />
                {p.name} <span style={{ color: "#666" }}>· {p.sharePercent}%</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {showPartnerForm && (
        <div className="admin-card">
          <h3 style={{ marginBottom: 16 }}>New Partner</h3>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 16 }}>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                className="form-control"
                value={partnerDraft.name}
                onChange={(e) => setPartnerDraft({ ...partnerDraft, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Contact</label>
              <input
                type="text"
                className="form-control"
                placeholder="Phone or email"
                value={partnerDraft.contact}
                onChange={(e) => setPartnerDraft({ ...partnerDraft, contact: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Share %</label>
              <input
                type="number"
                min={0}
                max={100}
                step={0.5}
                className="form-control"
                value={partnerDraft.sharePercent || ""}
                onChange={(e) =>
                  setPartnerDraft({
                    ...partnerDraft,
                    sharePercent: Number(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea
              className="form-control"
              style={{ minHeight: 60 }}
              value={partnerDraft.notes}
              onChange={(e) => setPartnerDraft({ ...partnerDraft, notes: e.target.value })}
            />
          </div>
          <button className="btn btn-primary" onClick={addPartner} disabled={savingPartner}>
            {savingPartner ? "Saving…" : "Save Partner"}
          </button>
        </div>
      )}

      {showPayoutForm && partners.length > 0 && (
        <div className="admin-card">
          <h3 style={{ marginBottom: 16 }}>Record Payout</h3>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 16 }}>
            <div className="form-group">
              <label>Partner</label>
              <select
                className="form-control"
                value={payoutDraft.partnerId || ""}
                onChange={(e) =>
                  setPayoutDraft({
                    ...payoutDraft,
                    partnerId: Number(e.target.value) || 0,
                  })
                }
              >
                <option value="">— Select partner —</option>
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Amount (PKR)</label>
              <input
                type="number"
                min={1}
                className="form-control"
                value={payoutDraft.amount || ""}
                onChange={(e) =>
                  setPayoutDraft({
                    ...payoutDraft,
                    amount: Number(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                className="form-control"
                value={payoutDraft.paidAt}
                onChange={(e) =>
                  setPayoutDraft({ ...payoutDraft, paidAt: e.target.value })
                }
              />
            </div>
          </div>
          <div className="form-group">
            <label>Notes</label>
            <input
              type="text"
              className="form-control"
              placeholder="Reference or method"
              value={payoutDraft.notes}
              onChange={(e) => setPayoutDraft({ ...payoutDraft, notes: e.target.value })}
            />
          </div>
          <button className="btn btn-primary" onClick={addPayout} disabled={savingPayout}>
            {savingPayout ? "Saving…" : "Record Payout"}
          </button>
        </div>
      )}

      <div className="admin-card" style={{ padding: 0, overflowX: "auto", marginBottom: 24 }}>
        {loading ? (
          <div style={{ padding: 24, color: "#999" }}>Loading partners…</div>
        ) : partners.length === 0 ? (
          <div className="empty-state">
            <h3>No partners yet</h3>
            <p>Add business partners with their profit-share %.</p>
          </div>
        ) : (
          <table className="admin-table" style={{ minWidth: 800 }}>
            <thead>
              <tr>
                <th>Partner</th>
                <th>Share</th>
                <th style={{ textAlign: "right" }}>Earned</th>
                <th style={{ textAlign: "right" }}>Paid</th>
                <th style={{ textAlign: "right" }}>Outstanding</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {partnerSummary.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    {p.contact && (
                      <div style={{ fontSize: "0.78rem", color: "#666" }}>
                        {p.contact}
                      </div>
                    )}
                  </td>
                  <td style={{ fontWeight: 600 }}>{p.sharePercent}%</td>
                  <td style={{ textAlign: "right" }}>{pkr(p.earned)}</td>
                  <td style={{ textAlign: "right", color: "#27ae60" }}>
                    {pkr(p.paid)}
                  </td>
                  <td
                    style={{
                      textAlign: "right",
                      fontWeight: 700,
                      color: p.outstanding > 0 ? "#e74c3c" : "#27ae60",
                    }}
                  >
                    {pkr(p.outstanding)}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      className="icon-btn icon-btn-danger"
                      onClick={() => removePartner(p)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <h3 style={{ marginBottom: 14 }}>Payout History</h3>
      <div className="admin-card" style={{ padding: 0, overflowX: "auto" }}>
        {payouts.length === 0 ? (
          <div className="empty-state">
            <p>No payouts recorded yet.</p>
          </div>
        ) : (
          <table className="admin-table" style={{ minWidth: 700 }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Partner</th>
                <th style={{ textAlign: "right" }}>Amount</th>
                <th>Notes</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {payouts.map((p) => (
                <tr key={p.id}>
                  <td style={{ color: "#666", fontSize: "0.82rem" }}>
                    {new Date(p.paidAt).toLocaleDateString("en-PK")}
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    {partnerById.get(p.partnerId)?.name ?? "(deleted)"}
                  </td>
                  <td style={{ textAlign: "right", fontWeight: 700 }}>
                    {pkr(p.amount)}
                  </td>
                  <td style={{ color: "#666", fontSize: "0.82rem" }}>
                    {p.notes ?? "—"}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      className="icon-btn icon-btn-danger"
                      onClick={() => removePayout(p)}
                    >
                      <Trash2 size={14} />
                    </button>
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
