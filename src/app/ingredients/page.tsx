"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/Container";

const INGREDIENTS = [
  {
    name: "Niacinamide (Vitamin B3)",
    benefit:
      "Regulates sebum production, minimizes pores, reduces blemishes, and strengthens the skin barrier. One of the most studied and versatile skincare actives.",
    evidence: "Strong",
    products: [
      "Niacinamide 10% Serum",
      "Brightening Cream",
      "Vitamin C Face Wash",
    ],
  },
  {
    name: "Ethyl Ascorbic Acid (Vitamin C)",
    benefit:
      "A stable form of Vitamin C that brightens skin, provides antioxidant protection against UV damage and pollution, and supports collagen synthesis.",
    evidence: "Strong",
    products: ["Vitamin C 10% Serum"],
  },
  {
    name: "Hyaluronic Acid",
    benefit:
      "A powerful humectant that holds up to 1000x its weight in water, providing multi-layer hydration. Different molecular weights target different skin depths.",
    evidence: "Strong",
    products: ["Hyaluronic Acid 2% Serum", "Brightening Cream"],
  },
  {
    name: "Zinc PCA",
    benefit:
      "Regulates oil production and has antimicrobial properties. Works synergistically with Niacinamide for enhanced acne control.",
    evidence: "Moderate",
    products: ["Niacinamide 10% Serum"],
  },
  {
    name: "D-Panthenol (Vitamin B5)",
    benefit:
      "Deeply hydrating and soothing. Strengthens the skin barrier, reduces transepidermal water loss, and promotes wound healing.",
    evidence: "Strong",
    products: ["Hyaluronic Acid 2% Serum"],
  },
  {
    name: "Alpha-Arbutin",
    benefit:
      "A gentle yet effective brightening agent that inhibits tyrosinase to reduce melanin production. Safer alternative to hydroquinone.",
    evidence: "Moderate",
    products: ["Brightening Cream", "Vitamin C Face Wash"],
  },
  {
    name: "Kojic Acid",
    benefit:
      "A naturally derived brightening agent from fungi. Targets hyperpigmentation and dark spots by inhibiting melanin production.",
    evidence: "Moderate",
    products: ["Brightening Cream"],
  },
  {
    name: "Titanium Dioxide",
    benefit:
      "Physical/mineral sunscreen filter that reflects and scatters UV rays. Provides broad-spectrum protection without chemical absorption.",
    evidence: "Strong",
    products: ["SPF 50 Sunscreen"],
  },
  {
    name: "Zinc Oxide",
    benefit:
      "Mineral UV filter offering superior UVA protection. Also has soothing and anti-inflammatory properties.",
    evidence: "Strong",
    products: ["SPF 50 Sunscreen"],
  },
  {
    name: "Tinosorb S",
    benefit:
      "Advanced broad-spectrum UV filter that absorbs, reflects, and scatters UV radiation. Photostable and rarely causes irritation.",
    evidence: "Strong",
    products: ["SPF 50 Sunscreen"],
  },
  {
    name: "Sodium Ascorbyl Phosphate",
    benefit:
      "A stable, water-soluble Vitamin C derivative. Provides antioxidant benefits, brightening, and antimicrobial activity against acne-causing bacteria.",
    evidence: "Moderate",
    products: ["Brightening Cream"],
  },
  {
    name: "Glycerin",
    benefit:
      "A humectant that draws moisture to the skin. Strengthens barrier function and improves skin texture and appearance.",
    evidence: "Strong",
    products: ["Vitamin C Face Wash", "Brightening Cream"],
  },
];

export default function IngredientsPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return INGREDIENTS;
    return INGREDIENTS.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.benefit.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <>
      <section className="bg-gradient-to-br from-veliscos-secondary to-[#162447] pt-40 pb-16 text-center text-white">
        <Container>
          <div className="text-xs font-semibold uppercase tracking-widest text-veliscos-accent-light mb-3">
            Transparency
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-semibold mb-3">
            Ingredient Glossary
          </h1>
          <p className="text-white/70">
            Know what goes on your skin. Every active, its purpose, and the
            science behind it.
          </p>
        </Container>
      </section>

      <section className="py-12">
        <Container>
          <div className="relative max-w-md mx-auto mb-12">
            <svg
              className="absolute left-5 top-1/2 -translate-y-1/2 text-veliscos-text-muted"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search ingredients..."
              className="w-full pl-12 pr-5 py-3.5 rounded-full border border-veliscos-border text-sm bg-white outline-none focus:border-veliscos-accent focus:ring-4 focus:ring-veliscos-accent/10"
            />
          </div>

          {filtered.length === 0 ? (
            <p className="text-center text-veliscos-text-muted py-10">
              No ingredients match your search.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((i) => (
                <div
                  key={i.name}
                  className="bg-veliscos-card border border-veliscos-border rounded-veliscos p-7 transition-all hover:border-veliscos-accent hover:shadow-soft"
                >
                  <div className="flex items-start gap-3 mb-3 flex-wrap">
                    <h3 className="font-heading font-semibold text-lg flex-1">
                      {i.name}
                    </h3>
                    <span className="inline-flex items-center bg-veliscos-accent/10 text-veliscos-accent px-2.5 py-0.5 rounded-full text-[0.65rem] font-semibold whitespace-nowrap">
                      {i.evidence} Evidence
                    </span>
                  </div>
                  <p className="text-veliscos-text-muted text-sm leading-relaxed mb-3">
                    {i.benefit}
                  </p>
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <strong className="text-xs font-semibold mr-1">
                      Found in:
                    </strong>
                    {i.products.map((p) => (
                      <span
                        key={p}
                        className="bg-veliscos-surface-alt text-veliscos-text-muted text-xs px-2.5 py-1 rounded-full"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Container>
      </section>

      <section className="bg-gradient-to-br from-veliscos-secondary to-[#162447] py-20 text-center text-white">
        <Container>
          <h2 className="font-heading text-3xl md:text-4xl font-semibold mb-4">
            Questions About Our Ingredients?
          </h2>
          <p className="text-white/70 max-w-lg mx-auto mb-7">
            We believe in full transparency. If you have questions about any
            ingredient we use, reach out to us.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-veliscos-accent text-white font-semibold text-sm hover:bg-veliscos-accent-light transition-colors"
          >
            Contact Us →
          </Link>
        </Container>
      </section>
    </>
  );
}
