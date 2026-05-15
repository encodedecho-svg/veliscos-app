import { supabase } from "./supabase";

export interface Announcement {
  text: string | null;
  bgColor: string;
  status: "active" | "inactive";
}

export interface PromoCode {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  validFrom: string | null;
  validTo: string | null;
  maxUses: number | null;
  usedCount: number;
  minSubtotal: number;
  active: boolean;
  createdAt: string;
}

type PromoRow = {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  valid_from: string | null;
  valid_to: string | null;
  max_uses: number | null;
  used_count: number;
  min_subtotal: number;
  active: boolean;
  created_at: string;
};

function rowToPromo(r: PromoRow): PromoCode {
  return {
    code: r.code,
    type: r.type,
    value: r.value,
    validFrom: r.valid_from,
    validTo: r.valid_to,
    maxUses: r.max_uses,
    usedCount: r.used_count,
    minSubtotal: r.min_subtotal,
    active: r.active,
    createdAt: r.created_at,
  };
}

// ── Announcement ─────────────────────────────────────────────────────
export async function getAnnouncement(): Promise<Announcement | null> {
  const { data, error } = await supabase
    .from("announcement")
    .select("text, bg_color, status")
    .eq("id", 1)
    .maybeSingle();
  if (error || !data) return null;
  return {
    text: (data as { text: string | null }).text,
    bgColor: (data as { bg_color: string }).bg_color,
    status: (data as { status: "active" | "inactive" }).status,
  };
}

export async function updateAnnouncement(
  patch: Partial<Announcement>
): Promise<{ error: string | null }> {
  const dbPatch: Record<string, unknown> = {};
  if (patch.text !== undefined) dbPatch.text = patch.text || null;
  if (patch.bgColor !== undefined) dbPatch.bg_color = patch.bgColor;
  if (patch.status !== undefined) dbPatch.status = patch.status;
  const { error } = await supabase.from("announcement").update(dbPatch).eq("id", 1);
  return { error: error?.message ?? null };
}

// ── Promo codes ──────────────────────────────────────────────────────
export async function listPromoCodes(): Promise<PromoCode[]> {
  const { data, error } = await supabase
    .from("promo_codes")
    .select("code, type, value, valid_from, valid_to, max_uses, used_count, min_subtotal, active, created_at")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("listPromoCodes:", error);
    return [];
  }
  return (data as PromoRow[]).map(rowToPromo);
}

export interface NewPromoInput {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  validFrom?: string;
  validTo?: string;
  maxUses?: number;
  minSubtotal?: number;
  active?: boolean;
}

export async function createPromoCode(
  input: NewPromoInput
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("promo_codes").insert({
    code: input.code.toUpperCase().trim(),
    type: input.type,
    value: input.value,
    valid_from: input.validFrom || null,
    valid_to: input.validTo || null,
    max_uses: input.maxUses ?? null,
    min_subtotal: input.minSubtotal ?? 0,
    active: input.active ?? true,
  });
  return { error: error?.message ?? null };
}

export async function setPromoActive(
  code: string,
  active: boolean
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("promo_codes")
    .update({ active })
    .eq("code", code);
  return { error: error?.message ?? null };
}

export async function deletePromoCode(
  code: string
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("promo_codes").delete().eq("code", code);
  return { error: error?.message ?? null };
}

// ── Storefront validation ────────────────────────────────────────────
export interface ValidatePromoResult {
  ok: boolean;
  error?: string;
  discount?: number;
  code?: PromoCode;
}

export async function validatePromoCode(
  code: string,
  subtotal: number
): Promise<ValidatePromoResult> {
  const normalized = code.toUpperCase().trim();
  if (!normalized) return { ok: false, error: "Enter a code." };

  const { data, error } = await supabase
    .from("promo_codes")
    .select("code, type, value, valid_from, valid_to, max_uses, used_count, min_subtotal, active, created_at")
    .eq("code", normalized)
    .eq("active", true)
    .maybeSingle();

  if (error) return { ok: false, error: "Couldn't validate code." };
  if (!data) return { ok: false, error: "Invalid or expired code." };

  const p = rowToPromo(data as PromoRow);
  const today = new Date().toISOString().slice(0, 10);

  if (p.validFrom && today < p.validFrom)
    return { ok: false, error: "This code isn't active yet." };
  if (p.validTo && today > p.validTo)
    return { ok: false, error: "This code has expired." };
  if (p.maxUses !== null && p.usedCount >= p.maxUses)
    return { ok: false, error: "This code is out of uses." };
  if (subtotal < p.minSubtotal)
    return {
      ok: false,
      error: `Minimum order of PKR ${p.minSubtotal} required for this code.`,
    };

  const discount =
    p.type === "percentage"
      ? Math.floor((subtotal * p.value) / 100)
      : Math.min(p.value, subtotal);
  return { ok: true, discount, code: p };
}

export async function incrementPromoUsage(code: string): Promise<void> {
  try {
    const { data } = await supabase
      .from("promo_codes")
      .select("used_count")
      .eq("code", code)
      .maybeSingle();
    if (!data) return;
    const used = (data as { used_count: number }).used_count;
    await supabase
      .from("promo_codes")
      .update({ used_count: used + 1 })
      .eq("code", code);
  } catch (err) {
    console.warn("incrementPromoUsage failed", err);
  }
}
