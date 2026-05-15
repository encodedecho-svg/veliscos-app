import { supabase } from "./supabase";
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
  return { error: error?.message ?? null };
}
