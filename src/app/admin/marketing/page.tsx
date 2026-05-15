"use client";

import { useCallback, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import {
  getAnnouncement,
  updateAnnouncement,
  listPromoCodes,
  createPromoCode,
  setPromoActive,
  deletePromoCode,
  type Announcement,
  type PromoCode,
  type NewPromoInput,
} from "@/lib/admin-promos";
import { logActivity } from "@/lib/admin-activity";
import { pkr } from "@/lib/format";

function emptyPromoDraft(): NewPromoInput {
  return {
    code: "",
    type: "percentage",
    value: 10,
    minSubtotal: 0,
    active: true,
  };
}

export default function AdminMarketingPage() {
  const [ann, setAnn] = useState<Announcement>({
    text: "",
    bgColor: "#1a2a44",
    status: "inactive",
  });
  const [annSaving, setAnnSaving] = useState(false);
  const [annLoaded, setAnnLoaded] = useState(false);

  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [promoLoading, setPromoLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<NewPromoInput>(emptyPromoDraft());
  const [creating, setCreating] = useState(false);

  const refresh = useCallback(async () => {
    setPromoLoading(true);
    const [a, p] = await Promise.all([getAnnouncement(), listPromoCodes()]);
    if (a) setAnn(a);
    setAnnLoaded(true);
    setPromos(p);
    setPromoLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function saveAnnouncement() {
    setAnnSaving(true);
    const { error } = await updateAnnouncement(ann);
    setAnnSaving(false);
    if (error) {
      alert(error);
      return;
    }
    logActivity({ action: "announcement.updated", entityType: "announcement" });
    alert("Announcement saved.");
  }

  async function addPromo() {
    if (!draft.code.trim() || !draft.value) {
      alert("Code and value are required.");
      return;
    }
    setCreating(true);
    const { error } = await createPromoCode(draft);
    setCreating(false);
    if (error) {
      alert(error);
      return;
    }
    logActivity({
      action: "promo.created",
      entityType: "promo",
      entityId: draft.code.toUpperCase(),
      details: { type: draft.type, value: draft.value },
    });
    setShowForm(false);
    setDraft(emptyPromoDraft());
    refresh();
  }

  async function toggleActive(p: PromoCode) {
    const { error } = await setPromoActive(p.code, !p.active);
    if (error) {
      alert(error);
      return;
    }
    logActivity({
      action: "promo.updated",
      entityType: "promo",
      entityId: p.code,
      details: { active: !p.active },
    });
    setPromos((ps) =>
      ps.map((x) => (x.code === p.code ? { ...x, active: !x.active } : x))
    );
  }

  async function removePromo(p: PromoCode) {
    if (!confirm(`Delete code ${p.code}?`)) return;
    const { error } = await deletePromoCode(p.code);
    if (error) {
      alert(error);
      return;
    }
    logActivity({
      action: "promo.deleted",
      entityType: "promo",
      entityId: p.code,
    });
    setPromos((ps) => ps.filter((x) => x.code !== p.code));
  }

  return (
    <div>
      <div className="admin-header">
        <h2>Marketing</h2>
      </div>

      <div className="admin-card">
        <h3 style={{ marginBottom: 14 }}>Announcement Banner</h3>
        <p style={{ color: "#666", fontSize: "0.85rem", marginBottom: 16 }}>
          Shown at the top of every storefront page when active. Use for promos,
          free-shipping campaigns, holiday closures, or restock alerts.
        </p>
        {!annLoaded ? (
          <p style={{ color: "#999" }}>Loading…</p>
        ) : (
          <>
            <div className="form-group">
              <label>Banner Text</label>
              <input
                type="text"
                className="form-control"
                value={ann.text ?? ""}
                onChange={(e) => setAnn({ ...ann, text: e.target.value })}
                placeholder="e.g. Free shipping on orders over PKR 3000 — this week only"
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="form-group">
                <label>Background Color</label>
                <input
                  type="color"
                  value={ann.bgColor}
                  onChange={(e) => setAnn({ ...ann, bgColor: e.target.value })}
                  style={{
                    height: 42,
                    width: "100%",
                    borderRadius: 12,
                    border: "1px solid #ddd",
                  }}
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  className="form-control"
                  value={ann.status}
                  onChange={(e) =>
                    setAnn({
                      ...ann,
                      status: e.target.value as "active" | "inactive",
                    })
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Live preview */}
            <div style={{ margin: "12px 0" }}>
              <div
                style={{
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                  color: "#999",
                  marginBottom: 6,
                }}
              >
                Preview
              </div>
              <div
                style={{
                  background: ann.bgColor || "#1a2a44",
                  color: "white",
                  padding: "10px 16px",
                  textAlign: "center",
                  fontSize: "0.85rem",
                  borderRadius: 10,
                }}
              >
                {ann.text || "(banner text appears here)"}
              </div>
            </div>

            <button
              className="btn btn-primary"
              onClick={saveAnnouncement}
              disabled={annSaving}
            >
              {annSaving ? "Saving…" : "Publish"}
            </button>
          </>
        )}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          margin: "24px 0 14px",
        }}
      >
        <h3 style={{ margin: 0 }}>Promo Codes</h3>
        <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Cancel" : "+ New Code"}
        </button>
      </div>

      {showForm && (
        <div className="admin-card">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr",
              gap: 16,
              marginBottom: 12,
            }}
          >
            <div className="form-group">
              <label>Code</label>
              <input
                type="text"
                className="form-control"
                style={{ textTransform: "uppercase" }}
                placeholder="WELCOME10"
                value={draft.code}
                onChange={(e) =>
                  setDraft({ ...draft, code: e.target.value.toUpperCase() })
                }
              />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select
                className="form-control"
                value={draft.type}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    type: e.target.value as "percentage" | "fixed",
                  })
                }
              >
                <option value="percentage">Percentage %</option>
                <option value="fixed">Fixed PKR</option>
              </select>
            </div>
            <div className="form-group">
              <label>Value</label>
              <input
                type="number"
                min={1}
                className="form-control"
                placeholder="10 or 500"
                value={draft.value || ""}
                onChange={(e) =>
                  setDraft({ ...draft, value: Number(e.target.value) || 0 })
                }
              />
            </div>
            <div className="form-group">
              <label>Active</label>
              <select
                className="form-control"
                value={String(draft.active ?? true)}
                onChange={(e) =>
                  setDraft({ ...draft, active: e.target.value === "true" })
                }
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr",
              gap: 16,
              marginBottom: 16,
            }}
          >
            <div className="form-group">
              <label>
                Valid From{" "}
                <span style={{ color: "#999", fontWeight: 400 }}>(optional)</span>
              </label>
              <input
                type="date"
                className="form-control"
                value={draft.validFrom ?? ""}
                onChange={(e) => setDraft({ ...draft, validFrom: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>
                Valid Until{" "}
                <span style={{ color: "#999", fontWeight: 400 }}>(optional)</span>
              </label>
              <input
                type="date"
                className="form-control"
                value={draft.validTo ?? ""}
                onChange={(e) => setDraft({ ...draft, validTo: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>
                Max Uses{" "}
                <span style={{ color: "#999", fontWeight: 400 }}>(blank = ∞)</span>
              </label>
              <input
                type="number"
                min={1}
                className="form-control"
                placeholder="e.g. 100"
                value={draft.maxUses ?? ""}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    maxUses: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
            </div>
            <div className="form-group">
              <label>Min Order (PKR)</label>
              <input
                type="number"
                min={0}
                className="form-control"
                placeholder="e.g. 2000"
                value={draft.minSubtotal ?? 0}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    minSubtotal: Number(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>
          <button className="btn btn-primary" onClick={addPromo} disabled={creating}>
            {creating ? "Creating…" : "Create Code"}
          </button>
        </div>
      )}

      <div className="admin-card" style={{ padding: 0, overflowX: "auto" }}>
        {promoLoading ? (
          <div style={{ padding: 24, color: "#999" }}>Loading codes…</div>
        ) : promos.length === 0 ? (
          <div className="empty-state">
            <h3>No promo codes yet</h3>
            <p>Create your first code with the button above.</p>
          </div>
        ) : (
          <table className="admin-table" style={{ minWidth: 800 }}>
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Validity</th>
                <th>Min Order</th>
                <th>Uses</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {promos.map((p) => (
                <tr key={p.code}>
                  <td style={{ fontFamily: "monospace", fontWeight: 700 }}>
                    {p.code}
                  </td>
                  <td>
                    {p.type === "percentage" ? `${p.value}%` : pkr(p.value)}
                  </td>
                  <td style={{ fontSize: "0.82rem", color: "#666" }}>
                    {p.validFrom || p.validTo
                      ? `${p.validFrom ?? "any"} → ${p.validTo ?? "any"}`
                      : "Always"}
                  </td>
                  <td>{p.minSubtotal > 0 ? pkr(p.minSubtotal) : "—"}</td>
                  <td>
                    {p.usedCount}
                    {p.maxUses !== null ? ` / ${p.maxUses}` : ""}
                  </td>
                  <td>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={p.active}
                        onChange={() => toggleActive(p)}
                      />
                      <span className="slider" />
                    </label>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      className="icon-btn icon-btn-danger"
                      onClick={() => removePromo(p)}
                      title="Delete"
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
