import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/Container";
import { ProductCard } from "@/components/ProductCard";
import { NewsletterForm } from "@/components/NewsletterForm";
import { getFeaturedProducts } from "@/lib/products";

export const revalidate = 60; // refresh featured products at most once per minute

const TRUST_ITEMS = [
  "Dermatologist-Informed",
  "Clinically Proven Actives",
  "Fragrance-Free",
  "Non-Comedogenic",
  "UK Registered",
  "Cruelty-Free",
];

const FEATURES = [
  {
    icon: "🔬",
    title: "Transparency",
    body: "Full ingredient clarity with exact percentages. Every claim is evidence-backed, never exaggerated.",
  },
  {
    icon: "⚗️",
    title: "Efficacy",
    body: "Only clinically proven actives at concentrations that actually work. No filler ingredients, no false promises.",
  },
  {
    icon: "🛡️",
    title: "Safety",
    body: "Fragrance-free, non-comedogenic formulations. Every batch undergoes microbial and stability testing.",
  },
  {
    icon: "✨",
    title: "Simplicity",
    body: "No 12-step routines. Minimalist products that do what they promise — clearly and effectively.",
  },
];

export default async function HomePage() {
  const featured = await getFeaturedProducts(6);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden pt-32 pb-20 bg-gradient-to-br from-veliscos-secondary via-[#0f0f23] to-[#162447] text-white">
        <div
          className="absolute inset-0 opacity-15 bg-center bg-cover"
          style={{ backgroundImage: "url(/images/hero-banner.png)" }}
        />
        <Container className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 bg-veliscos-gold/15 border border-veliscos-gold text-veliscos-gold px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-widest mb-6">
              🇬🇧 UK Registered Brand
            </div>
            <h1 className="font-heading font-semibold text-4xl md:text-5xl lg:text-6xl leading-[1.05] mb-5">
              Science-Backed Skincare.{" "}
              <span className="bg-gradient-to-br from-veliscos-accent-light to-veliscos-accent bg-clip-text text-transparent">
                Simplified.
              </span>
            </h1>
            <p className="text-lg text-white/70 leading-relaxed mb-9 max-w-lg">
              Clinical-grade formulations with transparent ingredients,
              dermatologist-informed efficacy, and prices that make sense. No
              fluff. Just results.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-veliscos-accent text-white font-semibold text-sm hover:bg-veliscos-accent-light transition-all hover:-translate-y-0.5 hover:shadow-lift"
              >
                Shop Now →
              </Link>
              <Link
                href="/ingredients"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border-2 border-white/30 text-white font-semibold text-sm hover:border-veliscos-accent transition-colors"
              >
                Our Ingredients
              </Link>
            </div>
          </div>
          <div className="hidden lg:flex justify-center">
            <Image
              src="/images/niacinamide-serum.png"
              alt="Veliscos Niacinamide Serum"
              width={500}
              height={500}
              className="max-w-[400px] drop-shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
              priority
            />
          </div>
        </Container>
      </section>

      {/* TRUST BAR */}
      <div className="bg-veliscos-primary py-5">
        <Container>
          <div className="flex justify-center gap-x-10 gap-y-3 flex-wrap text-white/80 text-sm font-medium">
            {TRUST_ITEMS.map((t) => (
              <div key={t} className="flex items-center gap-2 whitespace-nowrap">
                <span className="text-veliscos-accent-light">✓</span>
                {t}
              </div>
            ))}
          </div>
        </Container>
      </div>

      {/* PRODUCTS */}
      <section className="py-20">
        <Container>
          <div className="text-center mb-12">
            <div className="text-xs font-semibold uppercase tracking-widest text-veliscos-accent mb-3">
              Phase 1 Collection
            </div>
            <h2 className="font-heading text-3xl md:text-4xl font-semibold mb-4">
              Our Hero Products
            </h2>
            <p className="text-veliscos-text-muted max-w-xl mx-auto text-base leading-relaxed">
              Six clinically formulated essentials designed for real skin
              concerns. Every active at effective concentrations. Every claim
              backed by science.
            </p>
          </div>

          {featured.length === 0 ? (
            <p className="text-center text-veliscos-text-muted py-16">
              Featured products will appear here once your Supabase{" "}
              <code>products</code> table is seeded.{" "}
              <Link href="/shop" className="text-veliscos-accent underline">
                Visit the shop
              </Link>
              .
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border-2 border-veliscos-border text-veliscos-text font-semibold text-sm hover:border-veliscos-accent hover:text-veliscos-accent transition-colors"
            >
              View All Products →
            </Link>
          </div>
        </Container>
      </section>

      {/* WHY VELISCOS */}
      <section className="py-20 bg-veliscos-surface-alt">
        <Container>
          <div className="text-center mb-12">
            <div className="text-xs font-semibold uppercase tracking-widest text-veliscos-accent mb-3">
              Why Veliscos
            </div>
            <h2 className="font-heading text-3xl md:text-4xl font-semibold mb-4">
              Built Different. Built Better.
            </h2>
            <p className="text-veliscos-text-muted max-w-xl mx-auto text-base leading-relaxed">
              We don&apos;t do marketing gimmicks. We do clinically validated
              formulations at honest prices.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-veliscos-card border border-veliscos-border rounded-veliscos p-8 text-center transition-all hover:border-veliscos-accent hover:-translate-y-1 hover:shadow-soft"
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-heading font-semibold text-xl mb-3">
                  {f.title}
                </h3>
                <p className="text-veliscos-text-muted text-sm leading-relaxed">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* SCIENCE */}
      <section className="py-20">
        <Container>
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-veliscos-accent mb-3">
                The Science
              </div>
              <h2 className="font-heading text-3xl md:text-4xl font-semibold mb-5">
                Clinical-Grade Formulations
              </h2>
              <p className="text-veliscos-text-muted mb-5 leading-relaxed">
                Every Veliscos product is developed with dermatologist
                oversight and manufactured under GMP-certified conditions. We
                use globally trusted active ingredients at clinically validated
                concentrations.
              </p>
              <p className="text-veliscos-text-muted mb-8 leading-relaxed">
                Our commitment to science means every batch includes stability
                testing, microbial analysis, and packaging compatibility checks
                — the same standards used by international pharmaceutical
                brands.
              </p>
              <div className="flex gap-8">
                <div>
                  <div className="font-heading font-bold text-3xl text-veliscos-accent">
                    6
                  </div>
                  <div className="text-xs text-veliscos-text-muted mt-1">
                    Hero Products
                  </div>
                </div>
                <div>
                  <div className="font-heading font-bold text-3xl text-veliscos-accent">
                    100%
                  </div>
                  <div className="text-xs text-veliscos-text-muted mt-1">
                    Fragrance-Free
                  </div>
                </div>
                <div>
                  <div className="font-heading font-bold text-3xl text-veliscos-accent">
                    GMP
                  </div>
                  <div className="text-xs text-veliscos-text-muted mt-1">
                    Certified Mfg.
                  </div>
                </div>
              </div>
            </div>
            <div className="relative h-[400px] rounded-veliscos overflow-hidden bg-gradient-to-br from-veliscos-secondary to-[#162447] flex items-center justify-center">
              <span className="text-white font-heading font-semibold text-2xl text-center leading-snug">
                Dermatology
                <br />
                Meets
                <br />
                Accessibility
              </span>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-veliscos-secondary to-[#162447] py-20 text-center text-white">
        <Container>
          <div className="text-xs font-semibold uppercase tracking-widest text-veliscos-accent-light mb-3">
            Stay Updated
          </div>
          <h2 className="font-heading text-3xl md:text-4xl font-semibold mb-4">
            Join the Veliscos Community
          </h2>
          <p className="text-white/70 mb-8 max-w-md mx-auto">
            Be the first to know about new launches, skincare science, and
            exclusive offers.
          </p>
          <NewsletterForm />
        </Container>
      </section>
    </>
  );
}
