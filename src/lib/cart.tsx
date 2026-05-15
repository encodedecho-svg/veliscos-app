"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartItem, Product } from "./types";

const STORAGE_KEY = "veliscos_cart";

interface CartContextValue {
  items: CartItem[];
  count: number;
  add: (productId: string, qty?: number) => void;
  remove: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clear: () => void;
  getTotal: (priceLookup: (id: string) => number) => number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate once on mount from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* corrupted state — start fresh */
    }
    setHydrated(true);
  }, []);

  // Persist on change
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* quota exceeded — ignore */
    }
  }, [items, hydrated]);

  const add = useCallback((productId: string, qty: number = 1) => {
    setItems((curr) => {
      const existing = curr.find((i) => i.id === productId);
      if (existing) {
        return curr.map((i) =>
          i.id === productId ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [...curr, { id: productId, qty }];
    });
  }, []);

  const remove = useCallback((productId: string) => {
    setItems((curr) => curr.filter((i) => i.id !== productId));
  }, []);

  const updateQty = useCallback((productId: string, qty: number) => {
    setItems((curr) =>
      curr
        .map((i) => (i.id === productId ? { ...i, qty: Math.max(1, qty) } : i))
        .filter((i) => i.qty > 0)
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = useMemo(
    () => items.reduce((s, i) => s + i.qty, 0),
    [items]
  );

  const getTotal = useCallback(
    (priceLookup: (id: string) => number) =>
      items.reduce((s, i) => s + priceLookup(i.id) * i.qty, 0),
    [items]
  );

  const value = useMemo(
    () => ({ items, count, add, remove, updateQty, clear, getTotal }),
    [items, count, add, remove, updateQty, clear, getTotal]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

// Helper to build a priceLookup map from a list of products.
export function buildPriceLookup(products: Product[]): (id: string) => number {
  const map = new Map<string, number>();
  for (const p of products) map.set(p.id, p.price);
  return (id) => map.get(id) ?? 0;
}
