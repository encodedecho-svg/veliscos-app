"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, isAdmin, signIn, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user && isAdmin) router.replace("/admin/orders");
  }, [loading, user, isAdmin, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: err } = await signIn(email.trim(), password);
    setSubmitting(false);
    if (err) {
      setError(err);
      return;
    }
    // AuthProvider will refetch user; effect above redirects when isAdmin is true.
    // If the signed-in user isn't in admin_emails, show a clear message.
    setTimeout(() => {
      if (!isAdmin) {
        setError(
          "Signed in, but this account isn't an admin. Add the email to public.admin_emails in Supabase."
        );
      }
    }, 800);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-veliscos-card border border-veliscos-border rounded-veliscos p-8 shadow-lift">
        <h1 className="font-heading text-2xl font-semibold mb-2">Admin Login</h1>
        <p className="text-sm text-veliscos-text-muted mb-6">
          Sign in with your Veliscos staff account.
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <span className="block text-sm font-semibold mb-2">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              autoComplete="email"
            />
          </label>
          <label className="block">
            <span className="block text-sm font-semibold mb-2">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              autoComplete="current-password"
            />
          </label>
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700"
            >
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={submitting}
            className={`w-full px-6 py-3 rounded-full font-semibold text-sm text-white transition-all ${
              submitting
                ? "bg-veliscos-text-muted cursor-wait"
                : "bg-veliscos-accent hover:bg-veliscos-accent-light"
            }`}
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
