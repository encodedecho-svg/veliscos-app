"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { Container } from "./Container";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/ingredients", label: "Ingredients" },
  { href: "/contact", label: "Contact" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function Navbar() {
  const pathname = usePathname();
  const { count } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // Close mobile menu on route change
    setMobileOpen(false);
  }, [pathname]);

  const isCommerce =
    pathname.startsWith("/cart") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/product") ||
    pathname.startsWith("/shop");

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-all backdrop-blur-xl ${
        scrolled || isCommerce
          ? "bg-veliscos-surface/85 border-b border-veliscos-border shadow-soft py-2.5"
          : "bg-veliscos-surface/70 border-b border-transparent py-4"
      }`}
    >
      <Container className="flex items-center justify-between">
        <Link
          href="/"
          className="font-heading text-2xl font-bold text-veliscos-primary tracking-tight"
        >
          VELISCOS<span className="text-veliscos-accent">.</span>
        </Link>

        <ul className="hidden md:flex gap-8 items-center">
          {NAV_LINKS.map((l) => {
            const active = isActive(pathname, l.href);
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`relative text-sm font-medium transition-colors ${
                    active ? "text-veliscos-accent" : "text-veliscos-text hover:text-veliscos-accent"
                  }`}
                >
                  {l.label}
                  <span
                    className={`absolute left-0 -bottom-1 h-0.5 bg-veliscos-accent transition-all ${
                      active ? "w-full" : "w-0"
                    }`}
                  />
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-4">
          <Link
            href="/cart"
            aria-label="Cart"
            className="relative inline-flex items-center justify-center"
          >
            <svg
              width="22"
              height="22"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {count > 0 && (
              <span className="absolute -top-2 -right-2 bg-veliscos-accent text-white text-[0.6rem] w-[18px] h-[18px] rounded-full flex items-center justify-center font-semibold">
                {count}
              </span>
            )}
          </Link>

          <button
            type="button"
            aria-label="Menu"
            className="md:hidden flex flex-col gap-1 p-1"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <span
              className={`block h-0.5 w-6 bg-veliscos-primary transition-transform ${
                mobileOpen ? "translate-y-[6px] rotate-45" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-veliscos-primary transition-opacity ${
                mobileOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-veliscos-primary transition-transform ${
                mobileOpen ? "-translate-y-[6px] -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </Container>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 top-[60px] bg-veliscos-surface/98 backdrop-blur-xl flex flex-col items-center justify-center gap-6">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-lg font-medium text-veliscos-text"
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
