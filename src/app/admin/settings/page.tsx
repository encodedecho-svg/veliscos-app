"use client";

import { useCallback, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { getConfig, updateConfig, type AppConfig } from "@/lib/admin-config";
import {
  listStaff,
  addStaff,
  removeStaff,
  type StaffMember,
} from "@/lib/admin-staff";
import { logActivity } from "@/lib/admin-activity";
import { useAuth } from "@/lib/auth";

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [draft, setDraft] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [staffLoading, setStaffLoading] = useState(true);
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [addingStaff, setAddingStaff] = useState(false);

  const refreshStaff = useCallback(async () => {
    setStaffLoading(true);
    setStaff(await listStaff());
    setStaffLoading(false);
  }, []);

  useEffect(() => {
    getConfig().then((c) => {
      setConfig(c);
      setDraft(c);
      setLoading(false);
    });
    refreshStaff();
  }, [refreshStaff]);

  async function onAddStaff() {
    if (!newStaffEmail.trim()) return;
    setAddingStaff(true);
    const { error } = await addStaff(newStaffEmail);
    setAddingStaff(false);
    if (error) {
      setToast({ kind: "err", msg: error });
      return;
    }
    setToast({ kind: "ok", msg: `Added ${newStaffEmail.trim().toLowerCase()}` });
    setTimeout(() => setToast(null), 2500);
    setNewStaffEmail("");
    refreshStaff();
  }

  async function onRemoveStaff(email: string) {
    if (email === user?.email) {
      alert("You can't remove yourself — ask another admin to do it.");
      return;
    }
    if (!confirm(`Remove ${email} from admins?`)) return;
    const { error } = await removeStaff(email);
    if (error) {
      setToast({ kind: "err", msg: error });
      return;
    }
    setToast({ kind: "ok", msg: `Removed ${email}` });
    setTimeout(() => setToast(null), 2500);
    refreshStaff();
  }

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
        <h3 style={{ marginBottom: 8 }}>Staff (Admins)</h3>
        <p style={{ color: "#666", fontSize: "0.85rem", marginBottom: 16 }}>
          Each email here can sign in to this admin panel. To add staff:
          (1) create a Supabase Auth user in Supabase Studio with their email
          (Authentication → Users → Add User, toggle Auto Confirm), then
          (2) add the same email below.
        </p>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input
            type="email"
            className="form-control"
            placeholder="new-admin@example.com"
            value={newStaffEmail}
            onChange={(e) => setNewStaffEmail(e.target.value)}
            style={{ flex: 1 }}
          />
          <button
            className="btn btn-primary"
            onClick={onAddStaff}
            disabled={addingStaff || !newStaffEmail.trim()}
          >
            {addingStaff ? "Adding…" : "+ Add Admin"}
          </button>
        </div>
        {staffLoading ? (
          <p style={{ color: "#999", fontSize: "0.85rem" }}>Loading staff…</p>
        ) : staff.length === 0 ? (
          <p style={{ color: "#999", fontSize: "0.85rem" }}>No admins yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Added</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.email}>
                  <td>
                    {s.email}
                    {s.email === user?.email && (
                      <span
                        style={{
                          marginLeft: 8,
                          fontSize: "0.7rem",
                          padding: "2px 8px",
                          borderRadius: 6,
                          background: "#e3f2fd",
                          color: "#1e88e5",
                          fontWeight: 700,
                          textTransform: "uppercase",
                        }}
                      >
                        you
                      </span>
                    )}
                  </td>
                  <td style={{ color: "#666", fontSize: "0.82rem" }}>
                    {new Date(s.createdAt).toLocaleDateString("en-PK")}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      className="icon-btn icon-btn-danger"
                      onClick={() => onRemoveStaff(s.email)}
                      disabled={s.email === user?.email}
                      title={
                        s.email === user?.email
                          ? "You can't remove yourself"
                          : "Remove admin"
                      }
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
