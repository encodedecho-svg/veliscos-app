"use client";

import { useEffect, useState } from "react";
import { getConfig, updateConfig, type AppConfig } from "@/lib/admin-config";
import { logActivity } from "@/lib/admin-activity";

export default function AdminSettingsPage() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [draft, setDraft] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);

  useEffect(() => {
    getConfig().then((c) => {
      setConfig(c);
      setDraft(c);
      setLoading(false);
    });
  }, []);

  function setField<K extends keyof AppConfig>(key: K, value: AppConfig[K]) {
    setDraft((d) => (d ? { ...d, [key]: value } : d));
  }

  const dirty =
    config && draft && JSON.stringify(config) !== JSON.stringify(draft);

  async function save() {
    if (!draft) return;
    setSaving(true);
    const { error } = await updateConfig(draft);
    setSaving(false);
    if (error) {
      setToast({ kind: "err", msg: error });
      return;
    }
    await logActivity({ action: "config.updated", entityType: "config" });
    setConfig(draft);
    setToast({ kind: "ok", msg: "Settings saved." });
    setTimeout(() => setToast(null), 2500);
  }

  if (loading || !draft) {
    return (
      <div>
        <div className="admin-header">
          <h2>System Configuration</h2>
        </div>
        <p style={{ color: "#999" }}>Loading settings…</p>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-header">
        <h2>System Configuration</h2>
        {dirty && (
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
        )}
      </div>

      {toast && (
        <div
          className="admin-card"
          style={{
            background: toast.kind === "ok" ? "#e8f5e9" : "#fdecea",
            color: toast.kind === "ok" ? "#2e7d32" : "#e74c3c",
            borderColor: "transparent",
            padding: "12px 16px",
            fontSize: "0.85rem",
            fontWeight: 600,
            marginBottom: 16,
          }}
        >
          {toast.msg}
        </div>
      )}

      <div className="admin-card">
        <h3 style={{ marginBottom: 16 }}>Shipping Rules</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="form-group">
            <label>Flat Delivery Rate (PKR)</label>
            <input
              type="number"
              min={0}
              className="form-control"
              value={draft.shippingFlat}
              onChange={(e) => setField("shippingFlat", Number(e.target.value) || 0)}
            />
            <small style={{ color: "#999", fontSize: "0.75rem" }}>
              Charged on every order below the free-shipping threshold.
            </small>
          </div>
          <div className="form-group">
            <label>Free Shipping Threshold (PKR)</label>
            <input
              type="number"
              min={0}
              className="form-control"
              value={draft.freeShippingThreshold}
              onChange={(e) =>
                setField("freeShippingThreshold", Number(e.target.value) || 0)
              }
            />
            <small style={{ color: "#999", fontSize: "0.75rem" }}>
              Orders at or above this amount get free shipping.
            </small>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <h3 style={{ marginBottom: 16 }}>Brand Contact Info</h3>
        <p style={{ color: "#666", fontSize: "0.85rem", marginBottom: 16 }}>
          Shown in the storefront footer and order confirmations.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              className="form-control"
              value={draft.brandEmail ?? ""}
              onChange={(e) => setField("brandEmail", e.target.value)}
              placeholder="support@veliscos.com"
            />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              className="form-control"
              value={draft.brandPhone ?? ""}
              onChange={(e) => setField("brandPhone", e.target.value)}
              placeholder="03XX-XXXXXXX"
            />
          </div>
          <div className="form-group">
            <label>WhatsApp</label>
            <input
              type="tel"
              className="form-control"
              value={draft.brandWhatsapp ?? ""}
              onChange={(e) => setField("brandWhatsapp", e.target.value)}
              placeholder="03XX-XXXXXXX"
            />
          </div>
        </div>
      </div>

      <div className="admin-card">
        <h3 style={{ marginBottom: 16 }}>Payout Details</h3>
        <p style={{ color: "#666", fontSize: "0.85rem", marginBottom: 16 }}>
          Shown to customers after they pick a non-COD payment method on
          checkout.
        </p>
        <div className="form-group">
          <label>Bank Transfer</label>
          <input
            type="text"
            className="form-control"
            value={draft.payoutBank ?? ""}
            onChange={(e) => setField("payoutBank", e.target.value)}
            placeholder="Bank, Account Title, Account/IBAN"
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="form-group">
            <label>JazzCash</label>
            <input
              type="text"
              className="form-control"
              value={draft.payoutJazzcash ?? ""}
              onChange={(e) => setField("payoutJazzcash", e.target.value)}
              placeholder="Title — 03XX-XXXXXXX"
            />
          </div>
          <div className="form-group">
            <label>Easypaisa</label>
            <input
              type="text"
              className="form-control"
              value={draft.payoutEasypaisa ?? ""}
              onChange={(e) => setField("payoutEasypaisa", e.target.value)}
              placeholder="Title — 03XX-XXXXXXX"
            />
          </div>
        </div>
      </div>

      {dirty && (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      )}
    </div>
  );
}
