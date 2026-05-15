"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Container } from "@/components/Container";
import { useCart } from "@/lib/cart";
import { pkr } from "@/lib/format";
import { getProductsByIds } from "@/lib/products";
import { getConfig } from "@/lib/admin-config";
import type { Product } from "@/lib/types";

export default function CartPage() {
  const { items, updateQty, remove } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [shippingFlat, setShippingFlat] = useState(200);
  const [freeShipThreshold, setFreeShipThreshold] = useState(3000);

  useEffect(() => {
    getConfig().then((c) => {
      setShippingFlat(c.shippingFlat);
      setFreeShipThreshold(c.freeShippingThreshold);
    });
  }, []);

  useEffect(() => {
    const ids = items.map((i) => i.id);
    if (ids.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    getProductsByIds(ids).then((p) => {
      setProducts(p);
      setLoading(false);
    });
  }, [items]);

  const productById = new Map(products.map((p) => [p.id, p]));
  const subtotal = items.reduce((s, i) => {
    const p = productById.get(i.id);
    return s + (p ? p.price * i.qty : 0);
  }, 0);
  const shipping =
    subtotal === 0 ? 0 : subtotal >= freeShipThreshold ? 0 : shippingFlat;
  const total = subtotal + shipping;

  if (loading) {
    return (
      <section className="pt-32 pb-20">
        <Container>
          <h1 className="font-heading text-3xl font-semibold mb-8">
            Shopping Cart
          </h1>
          <p className="text-veliscos-text-muted">Loading…</p>
        </Container>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="pt-32 pb-20">
        <Container>
          <div className="text-center py-16">
            <h1 className="font-heading text-3xl font-semibold mb-3">
              Your Cart is Empty
            </h1>
            <p className="text-veliscos-text-muted mb-6">
              Looks like you haven&apos;t added any products yet.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-veliscos-accent text-white font-semibold text-sm hover:bg-veliscos-accent-light transition-colors"
            >
              Browse Products →
            </Link>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="pt-32 pb-20">
      <Container>
        <h1 className="font-heading text-3xl font-semibold mb-8">
          Shopping Cart{" "}
          <span className="text-base text-veliscos-text-muted font-normal">
            ({items.reduce((s, i) => s + i.qty, 0)} items)
          </span>
        </h1>

        <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
          <div className="space-y-4">
            {items.map((item) => {
              const p = productById.get(item.id);
              if (!p) {
                return (
                  <div
                    key={item.id}
                    className="bg-veliscos-card border border-veliscos-border rounded-veliscos p-6 text-veliscos-text-muted"
                  >
                    Product no longer available.{" "}
                    <button
                      onClick={() => remove(item.id)}
                      className="text-veliscos-accent underline"
                    >
                      Remove
                    </button>
                  </div>
                );
              }
              const image = p.image || "/images/brightening-cream.png";
              return (
                <div
                  key={item.id}
                  className="bg-veliscos-card border border-veliscos-border rounded-veliscos p-6 flex items-center gap-6 flex-wrap"
                >
                  <Image
                    src={image}
                    alt={p.name}
                    width={80}
                    height={80}
                    className="w-20 h-20 object-contain bg-veliscos-surface-alt rounded-lg p-2"
                  />
                  <div className="flex-1 min-w-[160px]">
                    <h3 className="font-semibold mb-1">{p.name}</h3>
                    <p className="text-veliscos-text-muted text-sm">
                      {p.size}
                      {p.type && ` · ${p.type}`}
                    </p>
                  </div>
                  <div className="flex items-center border border-veliscos-border rounded-full overflow-hidden">
                    <button
                      onClick={() => updateQty(item.id, item.qty - 1)}
                      className="w-10 h-10 hover:bg-veliscos-surface-alt"
                      aria-label="Decrease"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={item.qty}
                      readOnly
                      className="w-12 text-center font-semibold bg-transparent outline-none"
                    />
                    <button
                      onClick={() => updateQty(item.id, item.qty + 1)}
                      className="w-10 h-10 hover:bg-veliscos-surface-alt"
                      aria-label="Increase"
                    >
                      +
                    </button>
                  </div>
                  <div className="font-bold text-lg min-w-[100px] text-right">
                    {pkr(p.price * item.qty)}
                  </div>
                  <button
                    onClick={() => remove(item.id)}
                    aria-label="Remove"
                    className="text-veliscos-text-muted hover:text-rose-500 text-xl p-2"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>

          <div className="bg-veliscos-card border border-veliscos-border rounded-veliscos p-8 lg:sticky lg:top-24">
            <h3 className="font-heading text-xl font-semibold mb-5">
              Order Summary
            </h3>
            <div className="flex justify-between mb-3 text-sm">
              <span>Subtotal</span>
              <span>{pkr(subtotal)}</span>
            </div>
            <div className="flex justify-between mb-3 text-sm">
              <span>Shipping</span>
              <span>
                {shipping === 0 ? (
                  <span className="text-emerald-600 font-bold">Free</span>
                ) : (
                  pkr(shipping)
                )}
              </span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t-2 border-veliscos-border pt-4 mt-4">
              <span>Total</span>
              <span>{pkr(total)}</span>
            </div>
            <Link
              href="/checkout"
              className="block w-full text-center mt-5 px-6 py-3.5 rounded-full bg-veliscos-accent text-white font-semibold text-sm hover:bg-veliscos-accent-light transition-colors"
            >
              Proceed to Checkout
            </Link>
            <p className="text-center mt-3 text-xs text-veliscos-text-muted">
              Cash on Delivery · JazzCash · Easypaisa
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
