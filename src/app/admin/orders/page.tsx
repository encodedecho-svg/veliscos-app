"use client";

import { useCallback, useEffect, useState } from "react";
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

const STATUS_TONE: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-rose-100 text-rose-700",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [itemsCache, setItemsCache] = useState<Record<string, AdminOrderItem[]>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");

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

  const visible =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      <div className="flex items-end justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-3xl font-semibold">Orders</h1>
          <p className="text-sm text-veliscos-text-muted mt-1">
            {orders.length} total · {visible.length} shown
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["all", ...STATUS_OPTIONS] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors capitalize ${
                filter === s
                  ? "bg-veliscos-accent text-white border-veliscos-accent"
                  : "border-veliscos-border text-veliscos-text-muted hover:border-veliscos-accent"
              }`}
            >
              {s}
            </button>
          ))}
          <button
            onClick={refresh}
            className="px-4 py-1.5 rounded-full text-xs font-medium border border-veliscos-border text-veliscos-text-muted hover:border-veliscos-accent"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-veliscos-text-muted">Loading orders…</p>
      ) : visible.length === 0 ? (
        <div className="bg-veliscos-card border border-veliscos-border rounded-veliscos p-12 text-center text-veliscos-text-muted">
          No orders {filter !== "all" && `with status "${filter}"`} yet.
        </div>
      ) : (
        <div className="bg-veliscos-card border border-veliscos-border rounded-veliscos overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-veliscos-surface-alt text-veliscos-text-muted text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Order</th>
                <th className="text-left px-4 py-3 font-semibold">Customer</th>
                <th className="text-left px-4 py-3 font-semibold">City</th>
                <th className="text-left px-4 py-3 font-semibold">Payment</th>
                <th className="text-right px-4 py-3 font-semibold">Total</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-veliscos-border">
              {visible.map((o) => {
                const isOpen = expanded === o.id;
                const items = itemsCache[o.id];
                return (
                  <>
                    <tr key={o.id} className="hover:bg-veliscos-surface-alt/40">
                      <td className="px-4 py-3 font-mono text-xs">{o.id}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium">
                          {o.firstName} {o.lastName}
                        </div>
                        <div className="text-xs text-veliscos-text-muted">
                          {o.phone}
                        </div>
                      </td>
                      <td className="px-4 py-3">{o.city}</td>
                      <td className="px-4 py-3 capitalize">{o.paymentMethod}</td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {pkr(o.total)}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={o.status}
                          disabled={savingId === o.id}
                          onChange={(e) =>
                            changeStatus(o.id, e.target.value as OrderStatus)
                          }
                          className={`text-xs font-medium rounded-full px-3 py-1 border-0 capitalize ${
                            STATUS_TONE[o.status]
                          }`}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => toggleExpand(o.id)}
                          className="text-veliscos-accent text-xs font-medium hover:underline"
                        >
                          {isOpen ? "Hide" : "Details"}
                        </button>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr key={`${o.id}-detail`} className="bg-veliscos-surface-alt/30">
                        <td colSpan={7} className="px-6 py-5">
                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="text-xs uppercase tracking-wider text-veliscos-text-muted mb-2">
                                Delivery
                              </h4>
                              <p className="text-sm">
                                {o.address}, {o.city}
                                {o.zip ? ` — ${o.zip}` : ""}
                              </p>
                              <p className="text-sm text-veliscos-text-muted mt-1">
                                {o.email} · {o.phone}
                              </p>
                              {o.notes && (
                                <p className="text-sm mt-3 italic text-veliscos-text-muted">
                                  &ldquo;{o.notes}&rdquo;
                                </p>
                              )}
                              <p className="text-xs text-veliscos-text-muted mt-3">
                                Placed{" "}
                                {new Date(o.createdAt).toLocaleString("en-PK")}
                              </p>
                            </div>
                            <div>
                              <h4 className="text-xs uppercase tracking-wider text-veliscos-text-muted mb-2">
                                Line items
                              </h4>
                              {!items ? (
                                <p className="text-sm text-veliscos-text-muted">
                                  Loading…
                                </p>
                              ) : items.length === 0 ? (
                                <p className="text-sm text-veliscos-text-muted">
                                  No items found.
                                </p>
                              ) : (
                                <ul className="text-sm space-y-1.5">
                                  {items.map((it) => (
                                    <li
                                      key={it.id}
                                      className="flex justify-between gap-3"
                                    >
                                      <span className="flex-1">
                                        {it.productName}{" "}
                                        <span className="text-veliscos-text-muted">
                                          × {it.qty}
                                        </span>
                                      </span>
                                      <span className="font-semibold">
                                        {pkr(it.lineTotal)}
                                      </span>
                                    </li>
                                  ))}
                                  <li className="flex justify-between pt-2 border-t border-veliscos-border text-xs text-veliscos-text-muted">
                                    <span>Subtotal</span>
                                    <span>{pkr(o.subtotal)}</span>
                                  </li>
                                  <li className="flex justify-between text-xs text-veliscos-text-muted">
                                    <span>Shipping</span>
                                    <span>
                                      {o.shipping === 0 ? "Free" : pkr(o.shipping)}
                                    </span>
                                  </li>
                                  <li className="flex justify-between font-bold pt-1">
                                    <span>Total</span>
                                    <span>{pkr(o.total)}</span>
                                  </li>
                                </ul>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
