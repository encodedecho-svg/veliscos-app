"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";

interface Props {
  productId: string;
  productName: string;
  qty?: number;
  variant?: "card" | "detail";
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

export function AddToCartButton({
  productId,
  productName,
  qty = 1,
  variant = "card",
  className = "",
  children,
  disabled,
}: Props) {
  const { add } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    add(productId, qty);
    setJustAdded(true);
    showToast(productName);
    setTimeout(() => setJustAdded(false), 1400);
  }

  const baseClasses =
    variant === "detail"
      ? "flex-1 inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-semibold text-sm bg-veliscos-accent text-white hover:bg-veliscos-accent-light transition-all hover:-translate-y-0.5 hover:shadow-lift"
      : "inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full font-semibold text-xs bg-veliscos-accent text-white hover:bg-veliscos-accent-light transition-all";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
    >
      {justAdded ? "✓ Added" : children ?? "Add to Cart"}
    </button>
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
