import Link from "next/link";
import { Container } from "@/components/Container";

export const metadata = {
  title: "About — Veliscos Skincare",
  description:
    "Our story, values, and commitment to transparent, science-backed skincare for Pakistan.",
};

const VALUES = [
  {
    icon: "🔍",
    title: "Transparency",
    body: "Full ingredient clarity and evidence-backed claims. Know exactly what goes on your skin.",
  },
  {
    icon: "⚗️",
    title: "Efficacy",
    body: "Only clinically proven actives at effective concentrations. No filler, no fluff.",
  },
  {
    icon: "🛡️",
    title: "Safety",
    body: "Fragrance-free, non-comedogenic formulations produced under GMP conditions.",
  },
  {
    icon: "🎯",
    title: "Simplicity",
    body: "Minimalist routines and straightforward product communication. Less is more.",
  },
  {
    icon: "💰",
    title: "Accessibility",
    body: "Clinical quality at prices Pakistani consumers can afford. PKR 1,500–3,000.",
  },
];

const TIMELINE = [
  {
    title: "Market Research",
    body: "Analyzed Pakistan's $66M+ skincare market. Identified the gap between herbal and premium international brands.",
  },
  {
    title: "Formulation Development",
    body: "Partnered with chemists and dermatologists to develop clinically effective formulations using globally trusted actives.",
  },
  {
    title: "UK Registration",
    body: "Registered the brand in the UK for credibility and future export channels to UK/EU marketplaces.",
  },
  {
    title: "GMP Manufacturing",
    body: "Partnered with certified third-party manufacturers in Pakistan for quality-controlled production.",
  },
  {
    title: "Phase 1 Launch",
    body: "Launching 14 hero products via D2C website, social commerce, and select pharmacies nationwide.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-veliscos-secondary to-[#162447] pt-40 pb-20 text-center text-white">
        <Container>
          <div className="text-xs font-semibold uppercase tracking-widest text-veliscos-accent-light mb-3">
            Our Story
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-semibold mb-4">
            Skincare Should Be Honest
          </h1>
          <p className="text-white/70 max-w-xl mx-auto text-lg">
            We believe clinical-grade skincare shouldn&apos;t come with a luxury
            price tag — or a list of ingredients you can&apos;t pronounce.
          </p>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-veliscos-accent mb-3">
                Our Mission
              </div>
              <h2 className="font-heading text-3xl md:text-4xl font-semibold mb-5">
                Dermatology Meets Accessibility
              </h2>
              <p className="text-veliscos-text-muted mb-5 leading-relaxed">
                Veliscos was born from a simple observation: Pakistani consumers
                deserve clinical-grade skincare that&apos;s both effective and
                affordable. The gap between low-cost herbal products and
                expensive international brands left millions underserved.
              </p>
              <p className="text-veliscos-text-muted leading-relaxed">
                We deliver dermatologist-informed, clinically effective skincare
                that solves real skin problems — without the premium markup or
                false claims. Every formulation uses globally trusted actives at
                proven concentrations.
              </p>
            </div>
            <div className="rounded-veliscos bg-gradient-to-br from-veliscos-secondary to-[#162447] h-[400px] flex items-center justify-center text-white font-heading font-semibold text-2xl text-center leading-snug">
              Science First.
              <br />
              Always.
            </div>
          </div>
        </Container>
      </section>

      <section className="py-20 bg-veliscos-surface-alt">
        <Container>
          <div className="text-center mb-12">
            <div className="text-xs font-semibold uppercase tracking-widest text-veliscos-accent mb-3">
              Core Values
            </div>
            <h2 className="font-heading text-3xl md:text-4xl font-semibold">
              What We Stand For
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="bg-veliscos-card border border-veliscos-border rounded-veliscos p-7 text-center transition-all hover:border-veliscos-accent hover:-translate-y-1"
              >
                <div className="text-2xl mb-4">{v.icon}</div>
                <h3 className="font-heading font-semibold text-lg mb-2">
                  {v.title}
                </h3>
                <p className="text-veliscos-text-muted text-sm leading-relaxed">
                  {v.body}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <div className="text-center mb-12">
            <div className="text-xs font-semibold uppercase tracking-widest text-veliscos-accent mb-3">
              Our Journey
            </div>
            <h2 className="font-heading text-3xl md:text-4xl font-semibold mb-4">
              Building Veliscos
            </h2>
            <p className="text-veliscos-text-muted max-w-xl mx-auto leading-relaxed">
              From market research to formulation to launch — our path to
              redefining skincare in Pakistan.
            </p>
          </div>
          <div className="relative max-w-xl mx-auto pl-14">
            <div className="absolute top-0 bottom-0 left-5 w-0.5 bg-veliscos-accent" />
            {TIMELINE.map((step, i) => (
              <div key={step.title} className="relative mb-10 last:mb-0">
                <div className="absolute -left-9 top-1.5 w-3.5 h-3.5 rounded-full bg-veliscos-accent border-[3px] border-veliscos-surface" />
                <h3 className="font-heading font-semibold text-xl mb-2">
                  {step.title}
                </h3>
                <p className="text-veliscos-text-muted text-sm leading-relaxed">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-gradient-to-br from-veliscos-secondary to-[#162447] py-20 text-center text-white">
        <Container>
          <span className="inline-flex items-center gap-2 bg-veliscos-gold/15 border border-veliscos-gold text-veliscos-gold px-7 py-3 rounded-full text-base font-semibold mb-6">
            🇬🇧 UK Registered Brand
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-semibold mb-4">
            Global Standards. Local Prices.
          </h2>
          <p className="text-white/70 max-w-lg mx-auto mb-7">
            Veliscos is registered in the United Kingdom, meeting international
            standards for skincare labelling and claims — while being priced
            for the Pakistani consumer.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-veliscos-accent text-white font-semibold text-sm hover:bg-veliscos-accent-light transition-colors"
          >
            Explore Our Products →
          </Link>
        </Container>
      </section>
    </>
  );
}
