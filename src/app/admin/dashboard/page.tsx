"use client";

import { useEffect, useMemo, useState } from "react";
import { listOrders, type AdminOrder } from "@/lib/admin-orders";
import { listAllProducts } from "@/lib/admin-products";
import { listExpenses, type Expense } from "@/lib/admin-expenses";
import { pkr } from "@/lib/format";
import type { Product } from "@/lib/types";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const DAY_MS = 86_400_000;

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      listOrders(),
      listAllProducts(),
      // Expenses may not exist yet if migration 004 hasn't been run; tolerate.
      listExpenses().catch(() => [] as Expense[]),
    ]).then(([o, p, e]) => {
      setOrders(o);
      setProducts(p);
      setExpenses(e);
      setLoading(false);
    });
  }, []);

  // Date partitions
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthStartIso = monthStart.toISOString();
  const last7Start = new Date(now.getTime() - 7 * DAY_MS).toISOString();

  const metrics = useMemo(() => {
    const activeOrders = orders.filter((o) => o.status !== "cancelled");
    const totalRevenue = activeOrders.reduce((s, o) => s + o.total, 0);
    const monthOrders = activeOrders.filter((o) => o.createdAt >= monthStartIso);
    const monthRevenue = monthOrders.reduce((s, o) => s + o.total, 0);
    const last7Orders = activeOrders.filter((o) => o.createdAt >= last7Start);
    const last7Revenue = last7Orders.reduce((s, o) => s + o.total, 0);

    const totalOrderCount = orders.length;
    const monthOrderCount = orders.filter((o) => o.createdAt >= monthStartIso).length;
    const aov =
      activeOrders.length > 0 ? Math.round(totalRevenue / activeOrders.length) : 0;

    const monthAov =
      monthOrders.length > 0 ? Math.round(monthRevenue / monthOrders.length) : 0;

    const pendingCount = orders.filter((o) => o.status === "pending").length;

    // Product cost (COGS) — sum (cost_price × sold) for delivered+shipped+confirmed
    // We don't have order_items here so approximate using product.sold * cost_price.
    const cogs = products.reduce(
      (s, p) => s + (p.costPrice ?? 0) * p.sold,
      0
    );

    const monthExpenses = expenses
      .filter((e) => e.occurredAt >= monthStart.toISOString().slice(0, 10))
      .reduce((s, e) => s + e.amount, 0);
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

    const grossProfit = totalRevenue - cogs;
    const netProfit = grossProfit - totalExpenses;
    const monthNetEstimate = monthRevenue - monthExpenses;

    // Inventory
    const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 10);
    const outOfStock = products.filter((p) => p.stock === 0);
    const inventoryValue = products.reduce((s, p) => s + p.price * p.stock, 0);

    // Best day in last 30
    const byDay = new Map<string, number>();
    for (let i = 0; i < 30; i++) {
      const d = new Date(now.getTime() - i * DAY_MS).toISOString().slice(0, 10);
      byDay.set(d, 0);
    }
    for (const o of activeOrders) {
      const k = o.createdAt.slice(0, 10);
      if (byDay.has(k)) byDay.set(k, (byDay.get(k) ?? 0) + o.total);
    }
    let bestDay = { date: "", revenue: 0 };
    byDay.forEach((v, k) => {
      if (v > bestDay.revenue) bestDay = { date: k, revenue: v };
    });

    return {
      totalRevenue,
      monthRevenue,
      last7Revenue,
      totalOrderCount,
      monthOrderCount,
      pendingCount,
      aov,
      monthAov,
      cogs,
      monthExpenses,
      totalExpenses,
      grossProfit,
      netProfit,
      monthNetEstimate,
      lowStock,
      outOfStock,
      inventoryValue,
      bestDay,
    };
  }, [orders, products, expenses, monthStart, monthStartIso, last7Start, now]);

  const recent = orders.slice(0, 10);

  const topProducts = useMemo(
    () =>
      [...products]
        .filter((p) => p.sold > 0)
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 6),
    [products]
  );

  const today = new Date().toLocaleDateString("en-PK", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div>
      <div className="admin-header">
        <div>
          <h2>Performance Overview</h2>
          <p style={{ color: "#666", fontSize: "0.9rem", marginTop: 4 }}>
            {today}
          </p>
        </div>
      </div>

      {loading ? (
        <p style={{ color: "#999" }}>Loading dashboard…</p>
      ) : (
        <>
          {/* Row 1: This month KPIs */}
          <div
            style={{
              fontSize: "0.72rem",
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              color: "#999",
              fontWeight: 600,
              marginBottom: 10,
            }}
          >
            This Month
          </div>
          <div className="stat-cards">
            <div className="stat-card">
              <div className="label">Revenue</div>
              <div className="value revenue">{pkr(metrics.monthRevenue)}</div>
              <div style={{ fontSize: "0.72rem", color: "#999", marginTop: 4 }}>
                {metrics.monthOrderCount} orders
              </div>
            </div>
            <div className="stat-card">
              <div className="label">Net Estimate</div>
              <div
                className="value profit"
                style={{ color: metrics.monthNetEstimate >= 0 ? "#27ae60" : "#e74c3c" }}
              >
                {pkr(metrics.monthNetEstimate)}
              </div>
              <div style={{ fontSize: "0.72rem", color: "#999", marginTop: 4 }}>
                Revenue − Expenses ({pkr(metrics.monthExpenses)})
              </div>
            </div>
            <div className="stat-card">
              <div className="label">Avg Order Value</div>
              <div className="value">{pkr(metrics.monthAov)}</div>
            </div>
            <div className="stat-card">
              <div className="label">Pending Orders</div>
              <div
                className="value"
                style={{ color: metrics.pendingCount > 0 ? "#ff8f00" : "#1a1a2e" }}
              >
                {metrics.pendingCount}
              </div>
              <div style={{ fontSize: "0.72rem", color: "#999", marginTop: 4 }}>
                need action
              </div>
            </div>
          </div>

          {/* Row 2: All-time KPIs */}
          <div
            style={{
              fontSize: "0.72rem",
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              color: "#999",
              fontWeight: 600,
              marginBottom: 10,
            }}
          >
            All-Time
          </div>
          <div className="stat-cards">
            <div className="stat-card">
              <div className="label">Total Revenue</div>
              <div className="value revenue">{pkr(metrics.totalRevenue)}</div>
              <div style={{ fontSize: "0.72rem", color: "#999", marginTop: 4 }}>
                {metrics.totalOrderCount} orders · last 7d {pkr(metrics.last7Revenue)}
              </div>
            </div>
            <div className="stat-card">
              <div className="label">Gross Profit</div>
              <div
                className="value profit"
                style={{ color: metrics.grossProfit >= 0 ? "#27ae60" : "#e74c3c" }}
              >
                {pkr(metrics.grossProfit)}
              </div>
              <div style={{ fontSize: "0.72rem", color: "#999", marginTop: 4 }}>
                Revenue − COGS ({pkr(metrics.cogs)})
              </div>
            </div>
            <div className="stat-card">
              <div className="label">Net Profit</div>
              <div
                className="value profit"
                style={{ color: metrics.netProfit >= 0 ? "#27ae60" : "#e74c3c" }}
              >
                {pkr(metrics.netProfit)}
              </div>
              <div style={{ fontSize: "0.72rem", color: "#999", marginTop: 4 }}>
                − Expenses ({pkr(metrics.totalExpenses)})
              </div>
            </div>
            <div className="stat-card">
              <div className="label">Inventory Value</div>
              <div className="value">{pkr(metrics.inventoryValue)}</div>
              <div style={{ fontSize: "0.72rem", color: "#999", marginTop: 4 }}>
                {products.length} products
              </div>
            </div>
          </div>

          {/* Stock alerts */}
          {(metrics.lowStock.length + metrics.outOfStock.length) > 0 && (
            <div
              className="admin-card"
              style={{
                background: "#fff8e1",
                borderColor: "#ffe082",
                padding: "14px 18px",
                marginBottom: 24,
              }}
            >
              <p style={{ fontSize: "0.85rem", margin: 0 }}>
                {metrics.outOfStock.length > 0 && (
                  <>
                    <strong style={{ color: "#e74c3c" }}>
                      Out of stock ({metrics.outOfStock.length}):
                    </strong>{" "}
                    {metrics.outOfStock.map((p) => p.name).join(", ")}
                  </>
                )}
                {metrics.outOfStock.length > 0 && metrics.lowStock.length > 0 && " · "}
                {metrics.lowStock.length > 0 && (
                  <>
                    <strong style={{ color: "#ff8f00" }}>
                      Low stock ({metrics.lowStock.length}):
                    </strong>{" "}
                    {metrics.lowStock.map((p) => `${p.name} (${p.stock})`).join(", ")}
                  </>
                )}
              </p>
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr",
              gap: 24,
            }}
          >
            <div className="admin-card">
              <h3 style={{ marginBottom: 20 }}>Recent Orders</h3>
              {recent.length === 0 ? (
                <div className="empty-state">
                  <h3>No orders yet</h3>
                  <p>Orders placed on the storefront will appear here.</p>
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((o) => (
                      <tr key={o.id}>
                        <td style={{ fontFamily: "monospace", fontSize: "0.78rem" }}>
                          {o.id}
                        </td>
                        <td>
                          {o.firstName} {o.lastName}
                        </td>
                        <td style={{ fontWeight: 700 }}>{pkr(o.total)}</td>
                        <td>
                          <span className={`status-badge status-${o.status}`}>
                            {STATUS_LABEL[o.status] ?? o.status}
                          </span>
                        </td>
                        <td style={{ color: "#666", fontSize: "0.82rem" }}>
                          {new Date(o.createdAt).toLocaleDateString("en-PK")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div>
              <div className="admin-card">
                <h3 style={{ marginBottom: 14 }}>Top Sellers</h3>
                {topProducts.length === 0 ? (
                  <div className="empty-state">
                    <p>No sales data yet.</p>
                  </div>
                ) : (
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {topProducts.map((p) => (
                      <li
                        key={p.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "10px 0",
                          borderBottom: "1px solid #f0f0f0",
                          fontSize: "0.85rem",
                        }}
                      >
                        <span style={{ flex: 1 }}>{p.name}</span>
                        <span style={{ fontWeight: 600, color: "#4a90a4" }}>
                          {p.sold}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {metrics.bestDay.revenue > 0 && (
                <div className="admin-card">
                  <h3 style={{ marginBottom: 14 }}>Best Day (30d)</h3>
                  <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#4a90a4" }}>
                    {pkr(metrics.bestDay.revenue)}
                  </div>
                  <div style={{ fontSize: "0.82rem", color: "#666", marginTop: 4 }}>
                    {new Date(metrics.bestDay.date).toLocaleDateString("en-PK", {
                      weekday: "long",
                      day: "numeric",
                      month: "short",
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
