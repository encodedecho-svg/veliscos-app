"use client";

import { useCallback, useEffect, useState } from "react";
import {
  listAllProducts,
  patchProduct,
  type ProductPatch,
} from "@/lib/admin-products";
import { pkr } from "@/lib/format";
import type { Product } from "@/lib/types";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<Record<string, ProductPatch>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await listAllProducts();
    setProducts(data);
    setDrafts({});
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function setDraft(id: string, patch: ProductPatch) {
    setDrafts((d) => ({ ...d, [id]: { ...d[id], ...patch } }));
  }

  function hasDraft(id: string) {
    const d = drafts[id];
    return d && Object.keys(d).length > 0;
  }

  async function save(id: string) {
    const patch = drafts[id];
    if (!patch) return;
    setSavingId(id);
    const { error } = await patchProduct(id, patch);
    setSavingId(null);
    if (error) {
      alert(`Could not save: ${error}`);
      return;
    }
    setProducts((ps) =>
      ps.map((p) => {
        if (p.id !== id) return p;
        return {
          ...p,
          price: patch.price ?? p.price,
          costPrice:
            patch.costPrice === undefined ? p.costPrice : patch.costPrice,
          stock: patch.stock ?? p.stock,
          status: patch.status ?? p.status,
          featured: patch.featured ?? p.featured,
        };
      })
    );
    setDrafts((d) => {
      const { [id]: _, ...rest } = d;
      return rest;
    });
  }

  function fieldValue<T extends keyof ProductPatch>(
    p: Product,
    key: T,
    fallback: ProductPatch[T]
  ): ProductPatch[T] {
    const d = drafts[p.id];
    if (d && d[key] !== undefined) return d[key];
    return fallback;
  }

  return (
    <div>
      <div className="flex items-end justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-3xl font-semibold">Products</h1>
          <p className="text-sm text-veliscos-text-muted mt-1">
            {products.length} products · inline edit price, stock, status,
            featured
          </p>
        </div>
        <button
          onClick={refresh}
          className="px-4 py-1.5 rounded-full text-xs font-medium border border-veliscos-border text-veliscos-text-muted hover:border-veliscos-accent"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-veliscos-text-muted">Loading products…</p>
      ) : (
        <div className="bg-veliscos-card border border-veliscos-border rounded-veliscos overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead className="bg-veliscos-surface-alt text-veliscos-text-muted text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Product</th>
                <th className="text-left px-4 py-3 font-semibold">Category</th>
                <th className="text-right px-4 py-3 font-semibold">Price</th>
                <th className="text-right px-4 py-3 font-semibold">Cost</th>
                <th className="text-right px-4 py-3 font-semibold">Stock</th>
                <th className="text-right px-4 py-3 font-semibold">Sold</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-center px-4 py-3 font-semibold">Featured</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-veliscos-border">
              {products.map((p) => {
                const dirty = hasDraft(p.id);
                return (
                  <tr key={p.id} className={dirty ? "bg-amber-50/60" : ""}>
                    <td className="px-4 py-3">
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-veliscos-text-muted">
                        {p.id} · {p.size}
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize text-veliscos-text-muted">
                      {p.category}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <NumInput
                        value={fieldValue(p, "price", p.price)!}
                        onChange={(v) => setDraft(p.id, { price: v })}
                      />
                      <div className="text-[10px] text-veliscos-text-muted mt-0.5">
                        {pkr(fieldValue(p, "price", p.price)!)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <NumInput
                        value={fieldValue(p, "costPrice", p.costPrice) ?? 0}
                        onChange={(v) => setDraft(p.id, { costPrice: v })}
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <NumInput
                        value={fieldValue(p, "stock", p.stock)!}
                        onChange={(v) => setDraft(p.id, { stock: v })}
                      />
                    </td>
                    <td className="px-4 py-3 text-right text-veliscos-text-muted">
                      {p.sold}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={fieldValue(p, "status", p.status)!}
                        onChange={(e) =>
                          setDraft(p.id, {
                            status: e.target.value as "active" | "draft",
                          })
                        }
                        className="text-xs font-medium rounded-full px-3 py-1 border border-veliscos-border bg-white capitalize"
                      >
                        <option value="active">active</option>
                        <option value="draft">draft</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={fieldValue(p, "featured", p.featured)!}
                        onChange={(e) =>
                          setDraft(p.id, { featured: e.target.checked })
                        }
                        className="w-4 h-4 accent-veliscos-accent"
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {dirty && (
                        <button
                          onClick={() => save(p.id)}
                          disabled={savingId === p.id}
                          className="px-3 py-1.5 rounded-full bg-veliscos-accent text-white text-xs font-semibold hover:bg-veliscos-accent-light disabled:opacity-50"
                        >
                          {savingId === p.id ? "Saving…" : "Save"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function NumInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <input
      type="number"
      value={value}
      min={0}
      onChange={(e) => onChange(Number(e.target.value) || 0)}
      className="w-24 text-right px-2 py-1 rounded border border-veliscos-border bg-white"
    />
  );
}
