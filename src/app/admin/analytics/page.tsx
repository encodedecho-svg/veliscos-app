"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { listOrders, listOrderItems, type AdminOrder } from "@/lib/admin-orders";
import { listAllProducts } from "@/lib/admin-products";
import type { Product } from "@/lib/types";
import { pkr } from "@/lib/format";

const COLORS = [
  "#4a90a4",
  "#d4a373",
  "#27ae60",
  "#e74c3c",
  "#8e24aa",
  "#1e88e5",
  "#ff8f00",
  "#6c757d",
];

interface OrderItemAgg {
  productId: string;
  productName: string;
  qty: number;
  revenue: number;
}

export default function AdminAnalyticsPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [itemAgg, setItemAgg] = useState<OrderItemAgg[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([listOrders(), listAllProducts()]).then(async ([o, p]) => {
      setOrders(o);
      setProducts(p);

      // Pull items for all orders. For large catalogues this should
      // really be done with a server aggregate, but for now the volume
      // is small enough.
      const allItems = await Promise.all(o.slice(0, 200).map((or) => listOrderItems(or.id)));
      const byProduct = new Map<string, OrderItemAgg>();
      for (const items of allItems) {
        for (const it of items) {
          const existing = byProduct.get(it.productId);
          if (existing) {
            existing.qty += it.qty;
            existing.revenue += it.lineTotal;
          } else {
            byProduct.set(it.productId, {
              productId: it.productId,
              productName: it.productName,
              qty: it.qty,
              revenue: it.lineTotal,
            });
          }
        }
      }
      setItemAgg(Array.from(byProduct.values()));
      setLoading(false);
    });
  }, []);

  // ── Revenue trend (last 30 days) ────────────────────────────────
  const revenueByDay = useMemo(() => {
    const map = new Map<string, number>();
    const days: string[] = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push(key);
      map.set(key, 0);
    }
    for (const o of orders) {
      if (o.status === "cancelled") continue;
      const key = o.createdAt.slice(0, 10);
      if (map.has(key)) map.set(key, (map.get(key) ?? 0) + o.total);
    }
    return days.map((d) => ({
      date: d.slice(5),
      revenue: map.get(d) ?? 0,
    }));
  }, [orders]);

  // ── AOV trend (last 30 days) ────────────────────────────────────
  const aovByDay = useMemo(() => {
    const sums = new Map<string, { rev: number; n: number }>();
    const now = new Date();
    const days: string[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push(key);
      sums.set(key, { rev: 0, n: 0 });
    }
    for (const o of orders) {
      if (o.status === "cancelled") continue;
      const key = o.createdAt.slice(0, 10);
      const s = sums.get(key);
      if (s) {
        s.rev += o.total;
        s.n += 1;
      }
    }
    return days.map((d) => ({
      date: d.slice(5),
      aov: sums.get(d)!.n ? Math.round(sums.get(d)!.rev / sums.get(d)!.n) : 0,
    }));
  }, [orders]);

  // ── Top products ────────────────────────────────────────────────
  const topProducts = useMemo(
    () =>
      [...itemAgg]
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 8)
        .map((p) => ({ name: p.productName, qty: p.qty })),
    [itemAgg]
  );

  // ── Orders by city ─────────────────────────────────────────────
  const ordersByCity = useMemo(() => {
    const map = new Map<string, number>();
    for (const o of orders) map.set(o.city, (map.get(o.city) ?? 0) + 1);
    return Array.from(map.entries())
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [orders]);

  // ── Sales by category ──────────────────────────────────────────
  const salesByCategory = useMemo(() => {
    const byId = new Map(products.map((p) => [p.id, p]));
    const map = new Map<string, number>();
    for (const it of itemAgg) {
      const p = byId.get(it.productId);
      if (!p) continue;
      map.set(p.category, (map.get(p.category) ?? 0) + it.revenue);
    }
    return Array.from(map.entries()).map(([category, revenue]) => ({
      category,
      revenue,
    }));
  }, [itemAgg, products]);

  // ── Status breakdown ───────────────────────────────────────────
  const statusBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    for (const o of orders) map.set(o.status, (map.get(o.status) ?? 0) + 1);
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [orders]);

  // ── Payment split ──────────────────────────────────────────────
  const paymentSplit = useMemo(() => {
    const map = new Map<string, number>();
    for (const o of orders) map.set(o.paymentMethod, (map.get(o.paymentMethod) ?? 0) + 1);
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [orders]);

  return (
    <div>
      <div className="admin-header">
        <h2>Insights</h2>
        <p style={{ color: "#666", fontSize: "0.9rem" }}>
          Last 30 days · {orders.length} total orders
        </p>
      </div>

      {loading ? (
        <p style={{ color: "#999" }}>Loading analytics…</p>
      ) : orders.length === 0 ? (
        <div className="admin-card">
          <div className="empty-state">
            <h3>Not enough data yet</h3>
            <p>Charts populate once orders start coming in.</p>
          </div>
        </div>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 24,
              marginBottom: 24,
            }}
          >
            <ChartCard title="Revenue Trend (last 30 days)">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={revenueByDay}>
                  <CartesianGrid stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => pkr(v)} />
                  <Tooltip formatter={(v) => pkr(Number(v))} />
                  <Line type="monotone" dataKey="revenue" stroke="#4a90a4" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Top Products Sold">
              {topProducts.length === 0 ? (
                <Empty />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={topProducts} layout="vertical">
                    <CartesianGrid stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={130} />
                    <Tooltip />
                    <Bar dataKey="qty" fill="#d4a373" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 24,
              marginBottom: 24,
            }}
          >
            <ChartCard title="Orders by City">
              {ordersByCity.length === 0 ? (
                <Empty />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={ordersByCity}>
                    <CartesianGrid stroke="#f0f0f0" />
                    <XAxis dataKey="city" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#4a90a4" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard title="Sales by Category">
              {salesByCategory.length === 0 ? (
                <Empty />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={salesByCategory}
                      dataKey="revenue"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                    >
                      {salesByCategory.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => pkr(Number(v))} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 24,
              marginBottom: 24,
            }}
          >
            <ChartCard title="Order Status Breakdown">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={statusBreakdown}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                  >
                    {statusBreakdown.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Payment Method Split">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={paymentSplit}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                  >
                    {paymentSplit.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <ChartCard title="Average Order Value Trend (last 30 days)">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={aovByDay}>
                <CartesianGrid stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => pkr(v)} />
                <Tooltip formatter={(v) => pkr(Number(v))} />
                <Line type="monotone" dataKey="aov" stroke="#27ae60" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </>
      )}
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="admin-card">
      <h3 style={{ marginBottom: 16 }}>{title}</h3>
      {children}
    </div>
  );
}

function Empty() {
  return (
    <div style={{ padding: 30, textAlign: "center", color: "#999", fontSize: "0.85rem" }}>
      No data yet.
    </div>
  );
}
