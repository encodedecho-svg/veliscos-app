"use client";

import { useEffect, useState } from "react";
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
    if (!loading && user && isAdmin) router.replace("/admin/dashboard");
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
    setTimeout(() => {
      if (!isAdmin) {
        setError(
          "Signed in, but this account isn't an admin. Ask your administrator to add this email to the admin list."
        );
      }
    }, 800);
  }

  return (
    <div className="admin-login">
      <div className="login-card">
        <div className="nav-logo">
          VELISCOS<span>.</span>
        </div>
        <p>Secure Administrative Portal</p>

        <form onSubmit={onSubmit}>
          <div className="form-group" style={{ textAlign: "left" }}>
            <label htmlFor="admin-email">Email</label>
            <input
              id="admin-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
            />
          </div>
          <div className="form-group" style={{ textAlign: "left" }}>
            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
            />
          </div>

          {error && (
            <div
              role="alert"
              style={{
                color: "#e74c3c",
                fontSize: "0.85rem",
                marginTop: 4,
                marginBottom: 16,
                padding: "10px 12px",
                background: "#fdecea",
                borderRadius: 10,
                textAlign: "left",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{ width: "100%" }}
          >
            {submitting ? "Authenticating…" : "Authenticate"}
          </button>
        </form>
      </div>
    </div>
  );
}
