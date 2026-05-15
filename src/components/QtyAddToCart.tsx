"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";
import { pkr } from "@/lib/format";

interface Props {
  productId: string;
  productName: string;
  price: number;
  disabled?: boolean;
}

export function QtyAddToCart({ productId, productName, price, disabled }: Props) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  function onClick() {
    if (disabled) return;
    add(productId, qty);
    setJustAdded(true);
    showToast(productName);
    setTimeout(() => setJustAdded(false), 1400);
  }

  return (
    <div className="flex items-center gap-3 flex-wrap mb-8">
      <div className="flex items-center border border-veliscos-border rounded-full overflow-hidden">
        <button
          type="button"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="w-10 h-10 hover:bg-veliscos-surface-alt transition-colors"
          aria-label="Decrease"
        >
          −
        </button>
        <input
          type="number"
          value={qty}
          min={1}
          max={10}
          readOnly
          className="w-12 text-center font-semibold bg-transparent outline-none"
        />
        <button
          type="button"
          onClick={() => setQty((q) => Math.min(10, q + 1))}
          className="w-10 h-10 hover:bg-veliscos-surface-alt transition-colors"
          aria-label="Increase"
        >
          +
        </button>
      </div>

      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`flex-1 min-w-[200px] inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-semibold text-sm transition-all ${
          disabled
            ? "bg-veliscos-border text-veliscos-text-muted cursor-not-allowed"
            : "bg-veliscos-accent text-white hover:bg-veliscos-accent-light hover:-translate-y-0.5 hover:shadow-lift"
        }`}
      >
        {disabled
          ? "Out of Stock"
          : justAdded
          ? "✓ Added to Cart"
          : `Add to Cart — ${pkr(price * qty)}`}
      </button>
    </div>
  );
}

function showToast(productName: string) {
  if (typeof document === "undefined") return;
  const id = "veliscos-cart-toast";
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement("div");
    el.id = id;
    el.style.cssText =
      "position:fixed;bottom:24px;right:24px;z-index:9999;background:#0A0A0A;color:#fff;padding:14px 22px;border-radius:12px;box-shadow:0 12px 40px rgba(0,0,0,0.2);font-size:0.9rem;display:flex;align-items:center;gap:10px;font-family:Inter,sans-serif;transform:translateY(60px);opacity:0;transition:all 0.25s ease;";
    document.body.appendChild(el);
  }
  el.innerHTML = `<span style="color:#6BB5CC;font-size:1.1rem;">✓</span><strong style="font-weight:600;">${escapeHtml(
    productName
  )}</strong> added to cart`;
  requestAnimationFrame(() => {
    el!.style.transform = "translateY(0)";
    el!.style.opacity = "1";
  });
  setTimeout(() => {
    el!.style.transform = "translateY(60px)";
    el!.style.opacity = "0";
  }, 2200);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
