"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import {
  listAllProducts,
  patchProduct,
  createProduct,
  deleteProduct,
  slugify,
  type ProductPatch,
  type NewProductInput,
} from "@/lib/admin-products";
import { pkr } from "@/lib/format";
import type { Product, ProductCategory } from "@/lib/types";

const CATEGORIES: { key: ProductCategory; label: string }[] = [
  { key: "serums", label: "Serums" },
  { key: "sunscreen", label: "Sunscreen" },
  { key: "creams", label: "Creams" },
  { key: "moisturizers", label: "Moisturizers" },
  { key: "cleansers", label: "Cleansers" },
  { key: "exfoliants", label: "Exfoliants" },
];

type StockChip = "all" | "in" | "low" | "out";

const STOCK_CHIPS: { key: StockChip; label: string; color: string }[] = [
  { key: "all", label: "All", color: "#4a90a4" },
  { key: "in", label: "In stock", color: "#27ae60" },
  { key: "low", label: "Low", color: "#ff8f00" },
  { key: "out", label: "Out", color: "#e74c3c" },
];

function emptyNewProduct(): NewProductInput {
  return {
    id: "",
    name: "",
    category: "serums",
    type: "",
    size: "",
    price: 0,
    costPrice: 0,
    stock: 0,
    featured: false,
    description: "",
    howToUse: "",
    keyActives: [],
    skinType: [],
    badges: [],
    ingredients: "",
    image: "",
  };
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<Record<string, ProductPatch>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<ProductCategory | "all">("all");
  const [stockFilter, setStockFilter] = useState<StockChip>("all");

  const [showForm, setShowForm] = useState(false);
  const [newProduct, setNewProduct] = useState<NewProductInput>(emptyNewProduct());
  const [creating, setCreating] = useState(false);

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
      ps.map((p) =>
        p.id === id
          ? {
              ...p,
              price: patch.price ?? p.price,
              costPrice:
                patch.costPrice === undefined ? p.costPrice : patch.costPrice,
              stock: patch.stock ?? p.stock,
              status: patch.status ?? p.status,
              featured: patch.featured ?? p.featured,
            }
          : p
      )
    );
    setDrafts((d) => {
      const { [id]: _, ...rest } = d;
      return rest;
    });
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const { error } = await deleteProduct(id);
    if (error) {
      alert(`Could not delete: ${error}`);
      return;
    }
    setProducts((ps) => ps.filter((p) => p.id !== id));
  }

  async function addNewProduct() {
    if (!newProduct.name.trim() || !newProduct.price) {
      alert("Name and price are required.");
      return;
    }
    const id = newProduct.id.trim() || slugify(newProduct.name);
    const payload: NewProductInput = {
      ...newProduct,
      id,
      keyActives:
        typeof newProduct.keyActives === "string"
          ? (newProduct.keyActives as unknown as string)
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : newProduct.keyActives,
      skinType:
        typeof newProduct.skinType === "string"
          ? (newProduct.skinType as unknown as string)
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : newProduct.skinType,
      badges:
        typeof newProduct.badges === "string"
          ? (newProduct.badges as unknown as string)
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : newProduct.badges,
    };
    setCreating(true);
    const { error } = await createProduct(payload);
    setCreating(false);
    if (error) {
      alert(`Could not create: ${error}`);
      return;
    }
    setShowForm(false);
    setNewProduct(emptyNewProduct());
    refresh();
  }

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (catFilter !== "all" && p.category !== catFilter) return false;
      if (stockFilter === "in" && p.stock <= 10) return false;
      if (stockFilter === "low" && (p.stock === 0 || p.stock > 10)) return false;
      if (stockFilter === "out" && p.stock !== 0) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    });
  }, [products, search, catFilter, stockFilter]);

  const summary = useMemo(() => {
    const total = products.length;
    const active = products.filter((p) => p.status === "active").length;
    const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 10).length;
    const outOfStock = products.filter((p) => p.stock === 0).length;
    const inventoryValue = products.reduce((s, p) => s + p.price * p.stock, 0);
    return { total, active, lowStock, outOfStock, inventoryValue };
  }, [products]);

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
      <div className="admin-header">
        <h2>Inventory</h2>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="form-control"
            style={{ width: 240 }}
          />
          <button
            className="btn btn-primary"
            onClick={() => setShowForm((s) => !s)}
          >
            {showForm ? "Cancel" : "+ Add Product"}
          </button>
        </div>
      </div>

      <div className="kpi-grid" style={{ marginBottom: 20 }}>
        <div className="kpi-card">
          <div className="kpi-label">Total Products</div>
          <div className="kpi-value">{summary.total}</div>
          <div className="kpi-sub">{summary.active} active</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Inventory Value</div>
          <div className="kpi-value">{pkr(summary.inventoryValue)}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Low Stock</div>
          <div className="kpi-value" style={{ color: summary.lowStock > 0 ? "#ff8f00" : "#1a1a2e" }}>
            {summary.lowStock}
          </div>
          <div className="kpi-sub">stock ≤ 10</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Out of Stock</div>
          <div className="kpi-value" style={{ color: summary.outOfStock > 0 ? "#e74c3c" : "#1a1a2e" }}>
            {summary.outOfStock}
          </div>
        </div>
      </div>

      <div className="admin-card" style={{ marginBottom: 16, padding: "16px 20px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <span
              style={{
                fontSize: "0.72rem",
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                color: "#999",
                fontWeight: 600,
                marginRight: 4,
              }}
            >
              Category
            </span>
            <button
              className={`status-chip chip-all ${catFilter === "all" ? "active" : ""}`}
              onClick={() => setCatFilter("all")}
            >
              All
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                className={`status-chip chip-all ${catFilter === c.key ? "active" : ""}`}
                onClick={() => setCatFilter(c.key)}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <span
              style={{
                fontSize: "0.72rem",
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                color: "#999",
                fontWeight: 600,
                marginRight: 4,
              }}
            >
              Stock
            </span>
            {STOCK_CHIPS.map((c) => (
              <button
                key={c.key}
                className={`status-chip ${stockFilter === c.key ? "active" : ""}`}
                style={{ color: c.color, borderColor: c.color }}
                onClick={() => setStockFilter(c.key)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {showForm && (
        <div className="admin-card">
          <h3 style={{ marginBottom: 8 }}>Add New Product</h3>
          <p style={{ color: "#666", fontSize: "0.85rem", marginBottom: 8 }}>
            Stock auto-decrements as orders are placed. Edit anytime — changes
            reflect on the storefront immediately.
          </p>

          <div className="form-section">
            <div className="form-section-title">Basics</div>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 16 }}>
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select
                  className="form-control"
                  value={newProduct.category}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      category: e.target.value as ProductCategory,
                    })
                  }
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Size</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. 30ml"
                  value={newProduct.size}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, size: e.target.value })
                  }
                />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
              <div className="form-group">
                <label>Type / Subtitle</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Brightening / Antioxidant"
                  value={newProduct.type}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, type: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Featured</label>
                <select
                  className="form-control"
                  value={String(newProduct.featured)}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      featured: e.target.value === "true",
                    })
                  }
                >
                  <option value="false">No</option>
                  <option value="true">Yes (show on Home)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-title">Pricing & Stock</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              <div className="form-group">
                <label>Selling Price (PKR) *</label>
                <input
                  type="number"
                  min={0}
                  className="form-control"
                  value={newProduct.price || ""}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      price: Number(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Cost Price (PKR)</label>
                <input
                  type="number"
                  min={0}
                  className="form-control"
                  value={newProduct.costPrice || ""}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      costPrice: Number(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Current Stock</label>
                <input
                  type="number"
                  min={0}
                  className="form-control"
                  value={newProduct.stock ?? 0}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      stock: Number(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-title">Image</div>
            <div className="form-group">
              <label>Image URL</label>
              <input
                type="text"
                className="form-control"
                placeholder="/images/your-image.png"
                value={newProduct.image}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, image: e.target.value })
                }
              />
              <small style={{ color: "#999", fontSize: "0.75rem" }}>
                Image upload to Supabase Storage comes in Phase 4. For now,
                use a path like /images/foo.png after placing the file in
                public/images.
              </small>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-title">Product Details</div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                className="form-control"
                style={{ minHeight: 80 }}
                value={newProduct.description}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, description: e.target.value })
                }
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="form-group">
                <label>Key Actives (comma separated)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Niacinamide 10%, Zinc PCA 1%"
                  value={
                    Array.isArray(newProduct.keyActives)
                      ? newProduct.keyActives.join(", ")
                      : (newProduct.keyActives ?? "")
                  }
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      keyActives: e.target.value as unknown as string[],
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Skin Type (comma separated)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Oily, Combination"
                  value={
                    Array.isArray(newProduct.skinType)
                      ? newProduct.skinType.join(", ")
                      : (newProduct.skinType ?? "")
                  }
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      skinType: e.target.value as unknown as string[],
                    })
                  }
                />
              </div>
            </div>
            <div className="form-group">
              <label>How to Use</label>
              <textarea
                className="form-control"
                style={{ minHeight: 60 }}
                value={newProduct.howToUse}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, howToUse: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Badges (comma separated)</label>
              <input
                type="text"
                className="form-control"
                placeholder="Fragrance-Free, Cruelty-Free"
                value={
                  Array.isArray(newProduct.badges)
                    ? newProduct.badges.join(", ")
                    : (newProduct.badges ?? "")
                }
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    badges: e.target.value as unknown as string[],
                  })
                }
              />
            </div>
            <div className="form-group">
              <label>Full Ingredients (INCI list)</label>
              <textarea
                className="form-control"
                style={{ minHeight: 60 }}
                value={newProduct.ingredients}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, ingredients: e.target.value })
                }
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
            <button
              className="btn btn-primary"
              onClick={addNewProduct}
              disabled={creating}
            >
              {creating ? "Saving…" : "Save Product"}
            </button>
            <button
              className="btn btn-outline"
              onClick={() => {
                setShowForm(false);
                setNewProduct(emptyNewProduct());
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="admin-card" style={{ padding: 0, overflowX: "auto" }}>
        {loading ? (
          <div style={{ padding: 24, color: "#999" }}>Loading products…</div>
        ) : visible.length === 0 ? (
          <div className="empty-state">
            <h3>No products match your filters</h3>
            <p>Adjust the filters or add a new product.</p>
          </div>
        ) : (
          <table className="admin-table" style={{ minWidth: 1000 }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Size</th>
                <th>Price</th>
                <th>Cost</th>
                <th>Stock</th>
                <th>Sold</th>
                <th>Status</th>
                <th>Feat.</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {visible.map((p) => {
                const dirty = hasDraft(p.id);
                return (
                  <tr key={p.id} style={dirty ? { background: "#fff8e1" } : {}}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: "0.72rem", color: "#999" }}>
                        {p.id}
                      </div>
                    </td>
                    <td style={{ textTransform: "capitalize", color: "#666" }}>
                      {p.category}
                    </td>
                    <td style={{ color: "#666" }}>{p.size}</td>
                    <td>
                      <NumInput
                        value={fieldValue(p, "price", p.price)!}
                        onChange={(v) => setDraft(p.id, { price: v })}
                      />
                    </td>
                    <td>
                      <NumInput
                        value={fieldValue(p, "costPrice", p.costPrice) ?? 0}
                        onChange={(v) => setDraft(p.id, { costPrice: v })}
                      />
                    </td>
                    <td>
                      <NumInput
                        value={fieldValue(p, "stock", p.stock)!}
                        onChange={(v) => setDraft(p.id, { stock: v })}
                      />
                    </td>
                    <td style={{ color: "#666" }}>{p.sold}</td>
                    <td>
                      <select
                        value={fieldValue(p, "status", p.status)!}
                        onChange={(e) =>
                          setDraft(p.id, {
                            status: e.target.value as "active" | "draft",
                          })
                        }
                        className="form-control"
                        style={{ padding: "6px 10px", fontSize: "0.78rem", width: 90 }}
                      >
                        <option value="active">active</option>
                        <option value="draft">draft</option>
                      </select>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={fieldValue(p, "featured", p.featured)!}
                          onChange={(e) =>
                            setDraft(p.id, { featured: e.target.checked })
                          }
                        />
                        <span className="slider" />
                      </label>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        {dirty && (
                          <button
                            className="btn btn-primary"
                            style={{ padding: "6px 14px", fontSize: "0.78rem" }}
                            onClick={() => save(p.id)}
                            disabled={savingId === p.id}
                          >
                            {savingId === p.id ? "Saving…" : "Save"}
                          </button>
                        )}
                        <button
                          className="icon-btn icon-btn-danger"
                          onClick={() => remove(p.id, p.name)}
                          aria-label="Delete"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
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
      min={0}
      value={value}
      onChange={(e) => onChange(Number(e.target.value) || 0)}
      className="form-control"
      style={{ width: 88, padding: "6px 10px", fontSize: "0.85rem" }}
    />
  );
}
