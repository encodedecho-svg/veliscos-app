"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/Container";
import { useCart } from "@/lib/cart";
import { pkr } from "@/lib/format";
import { getProductsByIds } from "@/lib/products";
import { createOrder, type PaymentMethod } from "@/lib/orders";
import { getConfig } from "@/lib/admin-config";
import { validatePromoCode, type PromoCode } from "@/lib/admin-promos";
import type { Product } from "@/lib/types";

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
  const { items, clear } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState<PaymentMethod>("cod");
  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [shippingFlat, setShippingFlat] = useState(200);
  const [freeShipThreshold, setFreeShipThreshold] = useState(3000);

  const [promoInput, setPromoInput] = useState("");
  const [promoApplied, setPromoApplied] = useState<{
    code: string;
    discount: number;
  } | null>(null);
  const [promoErr, setPromoErr] = useState<string | null>(null);
  const [validatingPromo, setValidatingPromo] = useState(false);

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
    subtotal === 0 ? 0 : subtotal >= freeShipThreshold ? 0 : shippingFlat;
  const discount = promoApplied?.discount ?? 0;
  const total = Math.max(0, subtotal - discount + shipping);

  async function applyPromo() {
    if (!promoInput.trim()) return;
    setPromoErr(null);
    setValidatingPromo(true);
    const result = await validatePromoCode(promoInput, subtotal);
    setValidatingPromo(false);
    if (!result.ok || !result.code) {
      setPromoErr(result.error ?? "Invalid code.");
      setPromoApplied(null);
      return;
    }
    setPromoApplied({ code: result.code.code, discount: result.discount ?? 0 });
    setPromoInput(result.code.code);
  }

  function clearPromo() {
    setPromoApplied(null);
    setPromoErr(null);
    setPromoInput("");
  }

  async function placeOrder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);

    const fd = new FormData(e.currentTarget);
    const customer = {
      firstName: String(fd.get("firstName") ?? "").trim(),
      lastName: String(fd.get("lastName") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      phone: String(fd.get("phone") ?? "").trim(),
      address: String(fd.get("address") ?? "").trim(),
      city: String(fd.get("city") ?? "").trim(),
      zip: String(fd.get("zip") ?? "").trim() || undefined,
      notes: String(fd.get("notes") ?? "").trim() || undefined,
    };

    try {
      const result = await createOrder({
        customer,
        payment,
        items,
        products,
        shipping,
        discount,
        promoCode: promoApplied?.code,
      });
      if (promoApplied) {
        // Fire-and-forget; if it fails the order still went through.
        import("@/lib/admin-promos").then((m) =>
          m.incrementPromoUsage(promoApplied.code).catch(() => {})
        );
      }
      clear();
      setOrderPlaced(result.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not place order.");
    } finally {
      setSubmitting(false);
    }
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
              Thank you for your order. We&apos;ll contact you on the phone
              number provided to confirm delivery details.
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
                      onChange={() => setPayment(opt.value as PaymentMethod)}
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

            <div className="pt-3 border-t border-veliscos-border">
              <label className="block text-xs font-semibold mb-2 text-veliscos-text-muted uppercase tracking-wider">
                Promo Code
              </label>
              {promoApplied ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-sm">
                  <span>
                    <strong className="text-emerald-700">
                      {promoApplied.code}
                    </strong>{" "}
                    applied · −{pkr(promoApplied.discount)}
                  </span>
                  <button
                    type="button"
                    onClick={clearPromo}
                    className="text-emerald-700 underline text-xs"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                    placeholder="ENTER CODE"
                    className="flex-1 px-3 py-2 rounded-lg border border-veliscos-border text-sm uppercase"
                  />
                  <button
                    type="button"
                    onClick={applyPromo}
                    disabled={validatingPromo}
                    className="px-4 py-2 rounded-lg bg-veliscos-text text-white text-xs font-semibold disabled:opacity-60"
                  >
                    {validatingPromo ? "…" : "Apply"}
                  </button>
                </div>
              )}
              {promoErr && (
                <p className="text-xs text-rose-600 mt-2">{promoErr}</p>
              )}
            </div>

            <div className="space-y-2 text-sm pt-3 mt-3 border-t border-veliscos-border">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{pkr(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount ({promoApplied?.code})</span>
                  <span>−{pkr(discount)}</span>
                </div>
              )}
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

            {error && (
              <div
                role="alert"
                className="mt-5 rounded-lg border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700"
              >
                {error}
              </div>
            )}
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
