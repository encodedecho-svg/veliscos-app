import { supabase } from "./supabase";
import { logActivity } from "./admin-activity";
import type { Product, ProductCategory } from "./types";

type ProductRow = {
  id: string;
  name: string;
  category: ProductCategory;
  type: string | null;
  size: string | null;
  price: number;
  cost_price: number | null;
  currency: string;
  key_actives: string[] | null;
  description: string | null;
  how_to_use: string | null;
  skin_type: string[] | null;
  badges: string[] | null;
  ingredients: string | null;
  image: string | null;
  featured: boolean;
  status: "active" | "draft";
  stock: number;
  sold: number;
};

const COLS =
  "id, name, category, type, size, price, cost_price, currency, key_actives, description, how_to_use, skin_type, badges, ingredients, image, featured, status, stock, sold";

function rowToProduct(r: ProductRow): Product {
  return {
    id: r.id,
    name: r.name,
    category: r.category,
    type: r.type,
    size: r.size,
    price: r.price,
    costPrice: r.cost_price,
    currency: r.currency,
    keyActives: r.key_actives ?? [],
    description: r.description,
    howToUse: r.how_to_use,
    skinType: r.skin_type ?? [],
    badges: r.badges ?? [],
    ingredients: r.ingredients,
    image: r.image,
    featured: r.featured,
    status: r.status,
    stock: r.stock,
    sold: r.sold,
  };
}

export async function listAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(COLS)
    .order("status", { ascending: true })
    .order("featured", { ascending: false })
    .order("name", { ascending: true });
  if (error) {
    console.error("listAllProducts:", error);
    return [];
  }
  return (data as ProductRow[]).map(rowToProduct);
}

export interface ProductPatch {
  price?: number;
  costPrice?: number | null;
  stock?: number;
  status?: "active" | "draft";
  featured?: boolean;
}

export interface NewProductInput {
  id: string;
  name: string;
  category: ProductCategory;
  type?: string;
  size?: string;
  price: number;
  costPrice?: number;
  stock?: number;
  featured?: boolean;
  description?: string;
  howToUse?: string;
  keyActives?: string[];
  skinType?: string[];
  badges?: string[];
  ingredients?: string;
  image?: string;
}

export async function createProduct(
  input: NewProductInput
): Promise<{ error: string | null }> {
  const row = {
    id: input.id,
    name: input.name,
    category: input.category,
    type: input.type || null,
    size: input.size || null,
    price: input.price,
    cost_price: input.costPrice ?? null,
    stock: input.stock ?? 0,
    featured: input.featured ?? false,
    description: input.description || null,
    how_to_use: input.howToUse || null,
    key_actives: input.keyActives ?? [],
    skin_type: input.skinType ?? [],
    badges: input.badges ?? [],
    ingredients: input.ingredients || null,
    image: input.image || null,
  };
  const { error } = await supabase.from("products").insert(row);
  if (!error) {
    logActivity({
      action: "product.created",
      entityType: "product",
      entityId: input.id,
      details: { name: input.name, price: input.price },
    });
  }
  return { error: error?.message ?? null };
}

export async function deleteProduct(
  id: string
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (!error) {
    logActivity({
      action: "product.deleted",
      entityType: "product",
      entityId: id,
    });
  }
  return { error: error?.message ?? null };
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function patchProduct(
  id: string,
  patch: ProductPatch
): Promise<{ error: string | null }> {
  const dbPatch: Record<string, unknown> = {};
  if (patch.price !== undefined) dbPatch.price = patch.price;
  if (patch.costPrice !== undefined) dbPatch.cost_price = patch.costPrice;
  if (patch.stock !== undefined) dbPatch.stock = patch.stock;
  if (patch.status !== undefined) dbPatch.status = patch.status;
  if (patch.featured !== undefined) dbPatch.featured = patch.featured;
  const { error } = await supabase.from("products").update(dbPatch).eq("id", id);
  if (!error) {
    logActivity({
      action: "product.updated",
      entityType: "product",
      entityId: id,
      details: dbPatch as Record<string, unknown>,
    });
  }
  return { error: error?.message ?? null };
}
