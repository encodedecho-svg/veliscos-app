export type ProductCategory =
  | "serums"
  | "sunscreen"
  | "creams"
  | "moisturizers"
  | "cleansers"
  | "exfoliants";

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  type: string | null;
  size: string | null;
  price: number;
  costPrice: number | null;
  currency: string;
  keyActives: string[];
  description: string | null;
  howToUse: string | null;
  skinType: string[];
  badges: string[];
  ingredients: string | null;
  image: string | null;
  featured: boolean;
  status: "active" | "draft";
  stock: number;
  sold: number;
}

export interface CartItem {
  id: string;
  qty: number;
}
