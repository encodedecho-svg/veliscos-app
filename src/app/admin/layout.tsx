"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, isAdmin, signOut } = useAuth();

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (loading || isLoginPage) return;
    if (!user || !isAdmin) router.replace("/admin/login");
  }, [loading, user, isAdmin, isLoginPage, router]);

  if (isLoginPage) {
    return <div className="min-h-screen bg-veliscos-surface">{children}</div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-veliscos-surface flex items-center justify-center text-veliscos-text-muted">
        Loading…
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-veliscos-surface flex items-center justify-center text-veliscos-text-muted">
        Redirecting to login…
      </div>
    );
  }

  const tabs = [
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/products", label: "Products" },
  ];

  return (
    <div className="min-h-screen bg-veliscos-surface">
      <header className="bg-veliscos-card border-b border-veliscos-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-8 flex-wrap">
          <Link href="/admin/orders" className="font-heading text-xl font-semibold">
            Veliscos Admin
          </Link>
          <nav className="flex gap-1 flex-1">
            {tabs.map((t) => {
              const active = pathname?.startsWith(t.href);
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    active
                      ? "bg-veliscos-accent text-white"
                      : "text-veliscos-text-muted hover:bg-veliscos-surface-alt"
                  }`}
                >
                  {t.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-veliscos-text-muted hidden sm:inline">
              {user.email}
            </span>
            <Link
              href="/"
              className="text-veliscos-text-muted hover:text-veliscos-accent"
            >
              Storefront →
            </Link>
            <button
              onClick={async () => {
                await signOut();
                router.replace("/admin/login");
              }}
              className="px-3 py-1.5 rounded-full border border-veliscos-border text-veliscos-text-muted hover:border-veliscos-accent hover:text-veliscos-accent text-sm"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-10">{children}</main>
    </div>
  );
}
