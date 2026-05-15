"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/Container";
import { useCart } from "@/lib/cart";
import { pkr } from "@/lib/format";
import { getProductsByIds } from "@/lib/products";
import type { Product } from "@/lib/types";

const DEFAULT_SHIPPING = 200;
const FREE_SHIP_THRESHOLD = 3000;

const PAKISTANI_CITIES = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
  "Sialkot",
  "Hyderabad",
  "Other",
];

const PAYMENT_OPTIONS = [
  {
    value: "cod",
    label: "Cash on Delivery",
    icon: "💵",
    body: "Pay when your order arrives at your doorstep",
  },
  {
    value: "jazzcash",
    label: "JazzCash",
    icon: "📱",
    body: "Transfer to our JazzCash account — details provided after order",
  },
  {
    value: "easypaisa",
    label: "Easypaisa",
    icon: "📱",
    body: "Transfer to our Easypaisa account — details provided after order",
  },
  {
    value: "bank",
    label: "Bank Transfer",
    icon: "🏦",
    body: "Transfer to our bank account — details provided after order",
  },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState("cod");
  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState<string | null>(null);

  useEffect(() => {
    const ids = items.map((i) => i.id);
    if (ids.length === 0) {
      setProducts([]);
      setLoading(false);
      // If cart is empty and we haven't already placed an order, send back to cart
      if (!orderPlaced) {
        const t = setTimeout(() => router.push("/cart"), 800);
        return () => clearTimeout(t);
      }
      return;
    }
    setLoading(true);
    getProductsByIds(ids).then((p) => {
      setProducts(p);
      setLoading(false);
    });
  }, [items, router, orderPlaced]);

  const productById = new Map(products.map((p) => [p.id, p]));
  const subtotal = items.reduce((s, i) => {
    const p = productById.get(i.id);
    return s + (p ? p.price * i.qty : 0);
  }, 0);
  const shipping =
    subtotal === 0 ? 0 : subtotal >= FREE_SHIP_THRESHOLD ? 0 : DEFAULT_SHIPPING;
  const total = subtotal + shipping;

  async function placeOrder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    // Phase 2 will replace this with a real /api/orders POST.
    // For Phase 1 we just simulate a success so the UI flow is testable.
    const fakeId = "VLC-" + Date.now().toString(36).toUpperCase();
    await new Promise((r) => setTimeout(r, 600));
    setOrderPlaced(fakeId);
    setSubmitting(false);
  }

  if (orderPlaced) {
    return (
      <section className="pt-32 pb-20">
        <Container>
          <div className="max-w-xl mx-auto text-center bg-veliscos-card border border-veliscos-border rounded-veliscos p-12">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-veliscos-accent to-veliscos-accent-light text-white text-3xl flex items-center justify-center mx-auto mb-6">
              ✓
            </div>
            <h1 className="font-heading text-2xl font-semibold mb-3">
              Order Placed Successfully!
            </h1>
            <p className="text-veliscos-text-muted mb-5">
              Phase 1 preview — the checkout API ships in Phase 2. Your real
              orders will sync to Supabase from there.
            </p>
            <div className="inline-block bg-veliscos-surface-alt px-6 py-3 rounded-lg font-semibold tracking-widest mb-6 font-mono">
              {orderPlaced}
            </div>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link
                href="/shop"
                className="px-6 py-3 rounded-full bg-veliscos-accent text-white font-semibold text-sm hover:bg-veliscos-accent-light transition-colors"
              >
                Continue Shopping
              </Link>
              <Link
                href="/"
                className="px-6 py-3 rounded-full border-2 border-veliscos-border text-veliscos-text font-semibold text-sm hover:border-veliscos-accent hover:text-veliscos-accent transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="pt-32 pb-20">
        <Container>
          <p className="text-veliscos-text-muted">Loading…</p>
        </Container>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="pt-32 pb-20">
        <Container>
          <p className="text-veliscos-text-muted">
            Your cart is empty. Redirecting…
          </p>
        </Container>
      </section>
    );
  }

  return (
    <section className="pt-32 pb-20">
      <Container>
        <h1 className="font-heading text-3xl font-semibold mb-8">Checkout</h1>
        <form
          onSubmit={placeOrder}
          className="grid lg:grid-cols-[1fr_420px] gap-12 items-start"
        >
          <div className="space-y-6">
            <div className="bg-veliscos-card border border-veliscos-border rounded-veliscos p-8">
              <h2 className="font-heading text-xl font-semibold mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-veliscos-accent text-white text-sm flex items-center justify-center font-semibold">
                  1
                </span>
                Customer Information
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="First Name *" required>
                  <input
                    type="text"
                    name="firstName"
                    required
                    className="form-control"
                  />
                </Field>
                <Field label="Last Name *" required>
                  <input
                    type="text"
                    name="lastName"
                    required
                    className="form-control"
                  />
                </Field>
                <Field label="Email *" required>
                  <input
                    type="email"
                    name="email"
                    required
                    className="form-control"
                  />
                </Field>
                <Field label="Phone Number *" required>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="03XX-XXXXXXX"
                    className="form-control"
                  />
                </Field>
              </div>
              <div className="mt-4">
                <Field label="Delivery Address *" required>
                  <input
                    type="text"
                    name="address"
                    required
                    placeholder="House/Flat, Street, Area"
                    className="form-control"
                  />
                </Field>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 mt-4">
                <Field label="City *" required>
                  <select name="city" required className="form-control">
                    <option value="">Select City</option>
                    {PAKISTANI_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Postal Code">
                  <input
                    type="text"
                    name="zip"
                    placeholder="Optional"
                    className="form-control"
                  />
                </Field>
              </div>
              <div className="mt-4">
                <Field label="Order Notes (Optional)">
                  <textarea
                    name="notes"
                    rows={3}
                    className="form-control"
                    placeholder="Any special instructions…"
                  />
                </Field>
              </div>
            </div>

            <div className="bg-veliscos-card border border-veliscos-border rounded-veliscos p-8">
              <h2 className="font-heading text-xl font-semibold mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-veliscos-accent text-white text-sm flex items-center justify-center font-semibold">
                  2
                </span>
                Payment Method
              </h2>
              <div className="space-y-3">
                {PAYMENT_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-4 px-5 py-4 border-2 rounded-veliscos cursor-pointer transition-all ${
                      payment === opt.value
                        ? "border-veliscos-accent bg-veliscos-accent/5"
                        : "border-veliscos-border hover:border-veliscos-accent"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={opt.value}
                      checked={payment === opt.value}
                      onChange={() => setPayment(opt.value)}
                      className="w-[18px] h-[18px] accent-veliscos-accent"
                    />
                    <div>
                      <h4 className="text-sm font-semibold mb-0.5">
                        {opt.icon} {opt.label}
                      </h4>
                      <p className="text-xs text-veliscos-text-muted">
                        {opt.body}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <aside className="bg-veliscos-card border border-veliscos-border rounded-veliscos p-8 lg:sticky lg:top-24">
            <h2 className="font-heading text-xl font-semibold mb-5 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-veliscos-accent text-white text-sm flex items-center justify-center font-semibold">
                3
              </span>
              Order Summary
            </h2>
            <div className="space-y-3 max-h-[300px] overflow-y-auto mb-5">
              {items.map((item) => {
                const p = productById.get(item.id);
                if (!p) return null;
                const image = p.image || "/images/brightening-cream.png";
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 py-3 border-b border-veliscos-border last:border-b-0"
                  >
                    <Image
                      src={image}
                      alt={p.name}
                      width={50}
                      height={50}
                      className="w-12 h-12 object-contain bg-veliscos-surface-alt rounded p-1"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold truncate">
                        {p.name}
                      </h4>
                      <p className="text-xs text-veliscos-text-muted">
                        Qty: {item.qty} × {pkr(p.price)}
                      </p>
                    </div>
                    <div className="text-sm font-semibold whitespace-nowrap">
                      {pkr(p.price * item.qty)}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2 text-sm pt-3 border-t border-veliscos-border">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{pkr(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  {shipping === 0 ? (
                    <span className="text-emerald-600 font-bold">Free</span>
                  ) : (
                    pkr(shipping)
                  )}
                </span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t-2 border-veliscos-border pt-3 mt-3">
                <span>Total</span>
                <span>{pkr(total)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full mt-6 px-6 py-3.5 rounded-full font-semibold text-base text-white transition-all ${
                submitting
                  ? "bg-veliscos-text-muted cursor-wait"
                  : "bg-veliscos-accent hover:bg-veliscos-accent-light hover:-translate-y-0.5 hover:shadow-lift"
              }`}
            >
              {submitting ? "Processing…" : "Place Order"}
            </button>
            <p className="text-center mt-3 text-xs text-veliscos-text-muted">
              By placing this order, you agree to our terms of service.
            </p>
          </aside>
        </form>
      </Container>
    </section>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold mb-2">{label}</span>
      {children}
    </label>
  );
}
