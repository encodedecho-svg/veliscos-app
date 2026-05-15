"use client";

import { useState } from "react";
import { Container } from "@/components/Container";

const FAQS = [
  {
    q: "Is Veliscos a Pakistani or UK brand?",
    a: "Veliscos is a UK-registered brand with manufacturing in Pakistan. This allows us to maintain international standards while keeping prices accessible for local consumers.",
  },
  {
    q: "Are your products tested on animals?",
    a: "No. All Veliscos products are cruelty-free. We never test on animals and are committed to ethical skincare practices.",
  },
  {
    q: "Do you ship nationwide?",
    a: "Yes! We deliver across Pakistan with a flat shipping rate. Orders are typically processed within 1-2 business days.",
  },
  {
    q: "Can I return a product?",
    a: "We accept returns within 7 days of delivery if the product is unopened and in original packaging. For quality issues, we offer full replacements.",
  },
  {
    q: "Are your products suitable for sensitive skin?",
    a: "All Veliscos products are fragrance-free and non-comedogenic, making them suitable for sensitive skin. However, we always recommend a patch test before full application.",
  },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: wire to a real messages table in Phase 2.
    setSubmitted(true);
  }

  return (
    <>
      <section className="bg-gradient-to-br from-veliscos-secondary to-[#162447] pt-40 pb-16 text-center text-white">
        <Container>
          <div className="text-xs font-semibold uppercase tracking-widest text-veliscos-accent-light mb-3">
            Get in Touch
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-semibold mb-3">
            Contact Us
          </h1>
          <p className="text-white/70 max-w-xl mx-auto">
            Have questions about our products, ingredients, or wholesale
            partnerships? We&apos;d love to hear from you.
          </p>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <div className="grid lg:grid-cols-2 gap-16">
            <div className="bg-veliscos-card border border-veliscos-border rounded-veliscos p-10">
              <h2 className="font-heading text-2xl font-semibold mb-6">
                Send Us a Message
              </h2>
              {submitted ? (
                <div className="py-16 text-center">
                  <h3 className="font-heading text-2xl font-semibold mb-3">
                    ✓ Message Sent!
                  </h3>
                  <p className="text-veliscos-text-muted">
                    We&apos;ll get back to you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Your name"
                      className="form-control"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="your@email.com"
                      className="form-control"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Subject
                    </label>
                    <select className="form-control">
                      <option>Product Inquiry</option>
                      <option>Wholesale / Partnership</option>
                      <option>Skincare Advice</option>
                      <option>Shipping & Orders</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Message
                    </label>
                    <textarea
                      required
                      placeholder="How can we help?"
                      className="form-control"
                      rows={5}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full px-6 py-3.5 rounded-full bg-veliscos-accent text-white font-semibold text-sm hover:bg-veliscos-accent-light transition-colors"
                  >
                    Send Message
                  </button>
                </form>
              )}
            </div>

            <div className="space-y-5">
              <div className="bg-veliscos-card border border-veliscos-border rounded-veliscos p-8">
                <h3 className="font-heading font-semibold text-lg mb-4">
                  📧 Email
                </h3>
                <p className="text-veliscos-text-muted">hello@veliscos.com</p>
                <p className="text-veliscos-text-muted text-xs mt-2">
                  We respond within 24 hours
                </p>
              </div>
              <div className="bg-veliscos-card border border-veliscos-border rounded-veliscos p-8">
                <h3 className="font-heading font-semibold text-lg mb-4">
                  📱 Social Media
                </h3>
                <p className="text-veliscos-text-muted">
                  @veliscos on Instagram & TikTok
                </p>
                <p className="text-veliscos-text-muted text-xs mt-2">
                  DM us for quick questions
                </p>
              </div>
              <div className="bg-veliscos-card border border-veliscos-border rounded-veliscos p-8">
                <h3 className="font-heading font-semibold text-lg mb-4">
                  🏢 Business
                </h3>
                <p className="text-veliscos-text-muted">
                  For wholesale, pharmacy distribution, or B2B inquiries:
                </p>
                <p className="text-veliscos-accent font-semibold mt-2">
                  partnerships@veliscos.com
                </p>
              </div>

              <div className="pt-4">
                <h3 className="font-heading font-semibold text-lg mb-4">
                  Frequently Asked Questions
                </h3>
                <div className="space-y-3">
                  {FAQS.map((f, i) => (
                    <div
                      key={f.q}
                      className="border border-veliscos-border rounded-veliscos overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="w-full flex justify-between items-center px-5 py-4 font-semibold text-sm bg-veliscos-card hover:bg-veliscos-surface-alt transition-colors text-left"
                      >
                        <span>{f.q}</span>
                        <span
                          className={`transition-transform ${
                            openFaq === i ? "rotate-180" : ""
                          }`}
                        >
                          ▼
                        </span>
                      </button>
                      {openFaq === i && (
                        <div className="px-5 pb-4 text-sm text-veliscos-text-muted leading-relaxed">
                          {f.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
