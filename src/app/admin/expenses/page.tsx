"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import {
  listExpenses,
  createExpense,
  deleteExpense,
  type Expense,
  type ExpenseCategory,
} from "@/lib/admin-expenses";
import { pkr } from "@/lib/format";

const CATEGORIES: ExpenseCategory[] = [
  "Operations",
  "Marketing",
  "Packaging",
  "Shipping",
  "Other",
];

const CAT_COLOR: Record<ExpenseCategory, string> = {
  Operations: "#4a90a4",
  Marketing: "#d4a373",
  Packaging: "#8e24aa",
  Shipping: "#1e88e5",
  Other: "#6c757d",
};

export default function AdminExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({
    description: "",
    category: "Operations" as ExpenseCategory,
    amount: 0,
    occurredAt: new Date().toISOString().slice(0, 10),
  });
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setExpenses(await listExpenses());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function add() {
    if (!draft.description.trim() || !draft.amount) {
      alert("Description and amount required.");
      return;
    }
    setSaving(true);
    const { error } = await createExpense(draft);
    setSaving(false);
    if (error) {
      alert(`Could not add: ${error}`);
      return;
    }
    setShowForm(false);
    setDraft({
      description: "",
      category: "Operations",
      amount: 0,
      occurredAt: new Date().toISOString().slice(0, 10),
    });
    refresh();
  }

  async function remove(e: Expense) {
    if (!confirm(`Delete expense "${e.description}"?`)) return;
    const { error } = await deleteExpense(e.id);
    if (error) {
      alert(`Could not delete: ${error}`);
      return;
    }
    setExpenses((es) => es.filter((x) => x.id !== e.id));
  }

  const summary = useMemo(() => {
    const total = expenses.reduce((s, e) => s + e.amount, 0);
    const byCat: Record<ExpenseCategory, number> = {
      Operations: 0,
      Marketing: 0,
      Packaging: 0,
      Shipping: 0,
      Other: 0,
    };
    for (const e of expenses) byCat[e.category] += e.amount;
    const thisMonth = new Date().toISOString().slice(0, 7);
    const monthTotal = expenses
      .filter((e) => e.occurredAt.startsWith(thisMonth))
      .reduce((s, e) => s + e.amount, 0);
    return { total, byCat, monthTotal };
  }, [expenses]);

  return (
    <div>
      <div className="admin-header">
        <h2>Expense Ledger</h2>
        <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Cancel" : "+ Add Expense"}
        </button>
      </div>

      {/* Row 1: 2 headline KPIs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
          marginBottom: 14,
        }}
      >
        <div className="kpi-card">
          <div className="kpi-label">All-time Total</div>
          <div className="kpi-value">{pkr(summary.total)}</div>
          <div className="kpi-sub">{expenses.length} entries</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">This Month</div>
          <div className="kpi-value" style={{ color: "#4a90a4" }}>
            {pkr(summary.monthTotal)}
          </div>
          <div className="kpi-sub">
            {
              expenses.filter((e) =>
                e.occurredAt.startsWith(new Date().toISOString().slice(0, 7))
              ).length
            }{" "}
            entries
          </div>
        </div>
      </div>

      {/* Row 2: 5 categories, fixed equal columns */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 14,
          marginBottom: 20,
        }}
      >
        {CATEGORIES.map((c) => (
          <div className="kpi-card" key={c}>
            <div className="kpi-label">{c}</div>
            <div className="kpi-value" style={{ color: CAT_COLOR[c] }}>
              {pkr(summary.byCat[c])}
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="admin-card">
          <h3 style={{ marginBottom: 16 }}>New Expense</h3>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 16 }}>
            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                className="form-control"
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                placeholder="e.g. Domain renewal, Packaging boxes"
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select
                className="form-control"
                value={draft.category}
                onChange={(e) =>
                  setDraft({ ...draft, category: e.target.value as ExpenseCategory })
                }
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Amount (PKR)</label>
              <input
                type="number"
                min={0}
                className="form-control"
                value={draft.amount || ""}
                onChange={(e) =>
                  setDraft({ ...draft, amount: Number(e.target.value) || 0 })
                }
              />
            </div>
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                className="form-control"
                value={draft.occurredAt}
                onChange={(e) => setDraft({ ...draft, occurredAt: e.target.value })}
              />
            </div>
          </div>
          <button className="btn btn-primary" onClick={add} disabled={saving}>
            {saving ? "Saving…" : "Save Expense"}
          </button>
        </div>
      )}

      <div className="admin-card" style={{ padding: 0, overflowX: "auto" }}>
        {loading ? (
          <div style={{ padding: 24, color: "#999" }}>Loading expenses…</div>
        ) : expenses.length === 0 ? (
          <div className="empty-state">
            <h3>No expenses logged</h3>
            <p>Track operating costs to net against revenue in the dashboard.</p>
          </div>
        ) : (
          <table className="admin-table" style={{ minWidth: 700 }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th style={{ textAlign: "right" }}>Amount</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id}>
                  <td style={{ color: "#666", fontSize: "0.82rem" }}>
                    {new Date(e.occurredAt).toLocaleDateString("en-PK")}
                  </td>
                  <td style={{ fontWeight: 600 }}>{e.description}</td>
                  <td>
                    <span
                      style={{
                        padding: "3px 9px",
                        borderRadius: 8,
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        background: `${CAT_COLOR[e.category]}22`,
                        color: CAT_COLOR[e.category],
                      }}
                    >
                      {e.category}
                    </span>
                  </td>
                  <td style={{ textAlign: "right", fontWeight: 700 }}>
                    {pkr(e.amount)}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      className="icon-btn icon-btn-danger"
                      onClick={() => remove(e)}
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
