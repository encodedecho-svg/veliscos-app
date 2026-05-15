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

function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    type: row.type,
    size: row.size,
    price: row.price,
    costPrice: row.cost_price,
    currency: row.currency,
    keyActives: row.key_actives ?? [],
    description: row.description,
    howToUse: row.how_to_use,
    skinType: row.skin_type ?? [],
    badges: row.badges ?? [],
    ingredients: row.ingredients,
    image: row.image,
    featured: row.featured,
    status: row.status,
    stock: row.stock,
    sold: row.sold,
  };
}

const PRODUCT_COLUMNS =
  "id, name, category, type, size, price, cost_price, currency, key_actives, description, how_to_use, skin_type, badges, ingredients, image, featured, status, stock, sold";

export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("status", "active")
    .order("featured", { ascending: false })
    .order("name", { ascending: true });
  if (error) {
    console.error("getAllProducts:", error);
    return [];
  }
  return (data as ProductRow[]).map(rowToProduct);
}

export async function getFeaturedProducts(limit = 6): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("status", "active")
    .eq("featured", true)
    .order("name", { ascending: true })
    .limit(limit);
  if (error) {
    console.error("getFeaturedProducts:", error);
    return [];
  }
  return (data as ProductRow[]).map(rowToProduct);
}

export async function getProductsByCategory(
  category: ProductCategory | "all"
): Promise<Product[]> {
  if (category === "all") return getAllProducts();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("status", "active")
    .eq("category", category)
    .order("name", { ascending: true });
  if (error) {
    console.error("getProductsByCategory:", error);
    return [];
  }
  return (data as ProductRow[]).map(rowToProduct);
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("id", id)
    .eq("status", "active")
    .maybeSingle();
  if (error) {
    console.error("getProductById:", error);
    return null;
  }
  if (!data) return null;
  return rowToProduct(data as ProductRow);
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .in("id", ids);
  if (error) {
    console.error("getProductsByIds:", error);
    return [];
  }
  return (data as ProductRow[]).map(rowToProduct);
}

export async function getRelatedProducts(
  product: Product,
  limit = 3
): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("status", "active")
    .neq("id", product.id)
    .eq("category", product.category)
    .limit(limit);
  if (error) {
    console.error("getRelatedProducts:", error);
    return [];
  }
  let related = (data as ProductRow[]).map(rowToProduct);
  if (related.length < limit) {
    const extra = await supabase
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("status", "active")
      .neq("id", product.id)
      .neq("category", product.category)
      .limit(limit - related.length);
    if (!extra.error && extra.data) {
      related = related.concat((extra.data as ProductRow[]).map(rowToProduct));
    }
  }
  return related.slice(0, limit);
}
