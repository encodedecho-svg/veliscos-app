import type { AdminOrder } from "./admin-orders";

export type CustomerSegment = "vip" | "returning" | "new" | "at-risk";

export interface Customer {
  key: string; // lowercased email
  name: string;
  email: string;
  phone: string;
  city: string;
  orders: number;
  ltv: number;
  lastOrderAt: string; // ISO
  firstOrderAt: string; // ISO
  segment: CustomerSegment;
}

const DAY = 24 * 60 * 60 * 1000;

export function aggregateCustomers(orders: AdminOrder[]): Customer[] {
  const now = Date.now();

  const byEmail = new Map<
    string,
    {
      latest: AdminOrder;
      earliest: AdminOrder;
      orders: number;
      ltv: number;
    }
  >();

  for (const o of orders) {
    const key = o.email.trim().toLowerCase();
    if (!key) continue;
    const existing = byEmail.get(key);
    if (!existing) {
      byEmail.set(key, {
        latest: o,
        earliest: o,
        orders: 1,
        ltv: o.status === "cancelled" ? 0 : o.total,
      });
    } else {
      existing.orders += 1;
      if (o.status !== "cancelled") existing.ltv += o.total;
      if (new Date(o.createdAt) > new Date(existing.latest.createdAt)) {
        existing.latest = o;
      }
      if (new Date(o.createdAt) < new Date(existing.earliest.createdAt)) {
        existing.earliest = o;
      }
    }
  }

  const out: Customer[] = [];
  for (const [key, v] of byEmail.entries()) {
    const l = v.latest;
    const daysSinceLast = (now - new Date(l.createdAt).getTime()) / DAY;
    let segment: CustomerSegment;
    if (v.orders >= 3 || v.ltv >= 10000) segment = "vip";
    else if (v.orders >= 2) segment = "returning";
    else if (daysSinceLast <= 30) segment = "new";
    else segment = "at-risk";

    out.push({
      key,
      name: `${l.firstName} ${l.lastName}`.trim(),
      email: l.email,
      phone: l.phone,
      city: l.city,
      orders: v.orders,
      ltv: v.ltv,
      lastOrderAt: l.createdAt,
      firstOrderAt: v.earliest.createdAt,
      segment,
    });
  }
  return out;
}

export function customersToCSV(customers: Customer[]): string {
  const header = [
    "Segment",
    "Name",
    "Email",
    "Phone",
    "City",
    "Orders",
    "LTV (PKR)",
    "First Order",
    "Last Order",
  ];
  const escape = (s: string | number | null | undefined) => {
    const v = String(s ?? "");
    if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
    return v;
  };
  const lines = customers.map((c) =>
    [
      c.segment,
      c.name,
      c.email,
      c.phone,
      c.city,
      c.orders,
      c.ltv,
      new Date(c.firstOrderAt).toISOString(),
      new Date(c.lastOrderAt).toISOString(),
    ]
      .map(escape)
      .join(",")
  );
  return [header.join(","), ...lines].join("\n");
}
