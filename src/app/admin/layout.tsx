"use client";

import "./admin.css";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  LayoutDashboard,
  BarChart3,
  ShoppingCart,
  Package,
  Users,
  Handshake,
  Banknote,
  Ticket,
  ListChecks,
  Settings,
  LogOut,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";

const NAV_GROUPS: {
  title: string;
  items: { href: string; label: string; icon: LucideIcon }[];
}[] = [
  {
    title: "Analytics",
    items: [
      { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/analytics", label: "Insights", icon: BarChart3 },
    ],
  },
  {
    title: "Management",
    items: [
      { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
      { href: "/admin/products", label: "Inventory", icon: Package },
      { href: "/admin/customers", label: "Customers", icon: Users },
    ],
  },
  {
    title: "Financials",
    items: [
      { href: "/admin/partners", label: "Partners", icon: Handshake },
      { href: "/admin/expenses", label: "Expenses", icon: Banknote },
    ],
  },
  {
    title: "System",
    items: [
      { href: "/admin/marketing", label: "Promos", icon: Ticket },
      { href: "/admin/activity", label: "Activity Log", icon: ListChecks },
      { href: "/admin/settings", label: "Configuration", icon: Settings },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, isAdmin, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (loading || isLoginPage) return;
    if (!user || !isAdmin) router.replace("/admin/login");
  }, [loading, user, isAdmin, isLoginPage, router]);

  if (isLoginPage) {
    return <div className="admin-root">{children}</div>;
  }

  if (loading) {
    return (
      <div className="admin-root">
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#999",
          }}
        >
          Loading admin…
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="admin-root">
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#999",
          }}
        >
          Redirecting to login…
        </div>
      </div>
    );
  }

  return (
    <div className="admin-root">
      <div className="admin-container">
        <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="sidebar-header">
            <div className="nav-logo">
              VELISCOS<span>.</span>
              <small>Control Center</small>
            </div>
          </div>
          <div className="admin-tabs">
            {NAV_GROUPS.map((group) => (
              <div key={group.title}>
                <div className="nav-group-title">{group.title}</div>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = pathname?.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`admin-tab ${active ? "active" : ""}`}
                    >
                      <Icon size={16} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="admin-sidebar-footer">
            <button
              className="admin-tab"
              onClick={async () => {
                await signOut();
                router.replace("/admin/login");
              }}
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              <LogOut size={16} />
              <span>Sign out</span>
            </button>
          </div>
        </aside>

        <main className="admin-main">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 20px",
              borderBottom: "1px solid #eee",
              background: "white",
            }}
          >
            <button
              className="icon-btn"
              onClick={() => setSidebarOpen((s) => !s)}
              aria-label="Toggle sidebar"
              style={{ display: "inline-flex" }}
            >
              {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ fontSize: "0.82rem", color: "#666" }}>
                {user.email}
              </span>
              <Link
                href="/"
                style={{
                  fontSize: "0.82rem",
                  color: "var(--admin-primary)",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                Storefront →
              </Link>
            </div>
          </div>
          <div className="admin-content">{children}</div>
        </main>
      </div>
    </div>
  );
}
