"use client";

import { useEffect, useState } from "react";
import { listOrders, type AdminOrder } from "@/lib/admin-orders";
import { listAllProducts } from "@/lib/admin-products";
import { pkr } from "@/lib/format";
import type { Product } from "@/lib/types";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([listOrders(), listAllProducts()]).then(([o, p]) => {
      setOrders(o);
      setProducts(p);
      setLoading(false);
    });
  }, []);

  const revenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((s, o) => s + o.total, 0);
  const orderCount = orders.length;
  const avgOrder = orderCount > 0 ? Math.round(revenue / orderCount) : 0;
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 10).length;
  const outOfStock = products.filter((p) => p.stock === 0).length;

  const recent = orders.slice(0, 8);

  const productSales = new Map<string, number>();
  for (const o of orders) {
    if (o.status === "cancelled") continue;
    // We only have per-order totals here; for top products we'd need order_items.
    // Phase 4 can hydrate this; for now show top by stock-sold count.
  }
  const topProducts = [...products]
    .sort((a, b) => b.sold - a.sold)
    .filter((p) => p.sold > 0)
    .slice(0, 5);

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
          <div className="stat-cards">
            <div className="stat-card">
              <div className="label">Total Revenue</div>
              <div className="value revenue">{pkr(revenue)}</div>
            </div>
            <div className="stat-card">
              <div className="label">Total Orders</div>
              <div className="value">{orderCount}</div>
            </div>
            <div className="stat-card">
              <div className="label">Average Order Value</div>
              <div className="value">{pkr(avgOrder)}</div>
            </div>
            <div className="stat-card">
              <div className="label">Stock Alerts</div>
              <div className="value" style={{ color: lowStock + outOfStock > 0 ? "#e74c3c" : "#1a1a2e" }}>
                {lowStock + outOfStock}
              </div>
              <div style={{ fontSize: "0.72rem", color: "#999", marginTop: 4 }}>
                {outOfStock} out · {lowStock} low
              </div>
            </div>
          </div>

          {(lowStock + outOfStock) > 0 && (
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
                <strong>Low stock:</strong>{" "}
                {products
                  .filter((p) => p.stock > 0 && p.stock <= 10)
                  .map((p) => p.name)
                  .join(", ") || "—"}
                {outOfStock > 0 && (
                  <>
                    {" "}
                    · <strong>Out of stock:</strong>{" "}
                    {products
                      .filter((p) => p.stock === 0)
                      .map((p) => p.name)
                      .join(", ")}
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

            <div className="admin-card">
              <h3 style={{ marginBottom: 20 }}>Top Products Sold</h3>
              {topProducts.length === 0 ? (
                <div className="empty-state">
                  <p>Sales data appears here once orders ship.</p>
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
                        fontSize: "0.88rem",
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
          </div>
        </>
      )}
    </div>
  );
}
