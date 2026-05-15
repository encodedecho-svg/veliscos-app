"use client";

import { useCallback, useEffect, useState } from "react";
import { listActivity, type ActivityEntry } from "@/lib/admin-activity";

const ACTION_LABEL: Record<string, string> = {
  "order.status_changed": "Order status changed",
  "product.created": "Product created",
  "product.updated": "Product updated",
  "product.deleted": "Product deleted",
  "config.updated": "Settings updated",
  "promo.created": "Promo code created",
  "promo.updated": "Promo code updated",
  "promo.deleted": "Promo code deleted",
  "announcement.updated": "Announcement updated",
  "expense.created": "Expense added",
  "expense.deleted": "Expense removed",
  "partner.created": "Partner added",
  "partner.deleted": "Partner removed",
  "payout.created": "Payout recorded",
  "payout.deleted": "Payout removed",
};

function fmtDetails(d: Record<string, unknown> | null): string {
  if (!d) return "—";
  const parts = Object.entries(d)
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .slice(0, 4)
    .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : v}`);
  return parts.length ? parts.join(" · ") : "—";
}

export default function AdminActivityPage() {
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setEntries(await listActivity(200));
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div>
      <div className="admin-header">
        <h2>Activity Log</h2>
        <button
          className="btn btn-outline"
          onClick={refresh}
          style={{ padding: "8px 16px" }}
        >
          Refresh
        </button>
      </div>

      <div className="admin-card" style={{ padding: 0, overflowX: "auto" }}>
        {loading ? (
          <div style={{ padding: 24, color: "#999" }}>Loading activity…</div>
        ) : entries.length === 0 ? (
          <div className="empty-state">
            <h3>No activity yet</h3>
            <p>
              Admin actions (order status changes, product edits, settings
              updates) will appear here as you use the panel.
            </p>
          </div>
        ) : (
          <table className="admin-table" style={{ minWidth: 800 }}>
            <thead>
              <tr>
                <th>When</th>
                <th>Action</th>
                <th>Target</th>
                <th>Details</th>
                <th>By</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id}>
                  <td style={{ color: "#666", fontSize: "0.82rem" }}>
                    {new Date(e.createdAt).toLocaleString("en-PK")}
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    {ACTION_LABEL[e.action] ?? e.action}
                  </td>
                  <td style={{ color: "#666" }}>
                    {e.entityType ? (
                      <>
                        <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "#999" }}>
                          {e.entityType}
                        </span>{" "}
                        <span style={{ fontFamily: "monospace", fontSize: "0.78rem" }}>
                          {e.entityId ?? "—"}
                        </span>
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td style={{ color: "#666", fontSize: "0.82rem", maxWidth: 360, wordBreak: "break-word" }}>
                    {fmtDetails(e.details)}
                  </td>
                  <td style={{ color: "#666", fontSize: "0.82rem" }}>{e.actorEmail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
