"use client";

import { useState } from "react";

export function NewsletterForm() {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    // TODO: wire to a real subscribers table in Phase 2.
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <p className="text-white font-semibold py-4">
        ✓ Thank you! You&apos;re on the list.
      </p>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex gap-3 max-w-md mx-auto flex-col sm:flex-row"
    >
      <input
        type="email"
        required
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1 px-5 py-3.5 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/50 outline-none focus:border-veliscos-accent"
      />
      <button
        type="submit"
        className="px-8 py-3.5 rounded-full bg-veliscos-accent text-white font-semibold text-sm hover:bg-veliscos-accent-light transition-colors"
      >
        Subscribe
      </button>
    </form>
  );
}
