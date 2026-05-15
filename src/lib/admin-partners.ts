import { supabase } from "./supabase";
import { logActivity } from "./admin-activity";

export interface Partner {
  id: number;
  name: string;
  contact: string | null;
  sharePercent: number;
  notes: string | null;
  createdAt: string;
}

export interface Payout {
  id: number;
  partnerId: number;
  amount: number;
  paidAt: string;
  notes: string | null;
  createdAt: string;
}

type PartnerRow = {
  id: number;
  name: string;
  contact: string | null;
  share_percent: number;
  notes: string | null;
  created_at: string;
};

type PayoutRow = {
  id: number;
  partner_id: number;
  amount: number;
  paid_at: string;
  notes: string | null;
  created_at: string;
};

export async function listPartners(): Promise<Partner[]> {
  const { data, error } = await supabase
    .from("partners")
    .select("id, name, contact, share_percent, notes, created_at")
    .order("share_percent", { ascending: false });
  if (error) {
    console.error("listPartners:", error);
    return [];
  }
  return (data as PartnerRow[]).map((r) => ({
    id: r.id,
    name: r.name,
    contact: r.contact,
    sharePercent: Number(r.share_percent),
    notes: r.notes,
    createdAt: r.created_at,
  }));
}

export async function listPayouts(): Promise<Payout[]> {
  const { data, error } = await supabase
    .from("payouts")
    .select("id, partner_id, amount, paid_at, notes, created_at")
    .order("paid_at", { ascending: false });
  if (error) {
    console.error("listPayouts:", error);
    return [];
  }
  return (data as PayoutRow[]).map((r) => ({
    id: r.id,
    partnerId: r.partner_id,
    amount: r.amount,
    paidAt: r.paid_at,
    notes: r.notes,
    createdAt: r.created_at,
  }));
}

export interface NewPartnerInput {
  name: string;
  contact?: string;
  sharePercent: number;
  notes?: string;
}

export async function createPartner(
  input: NewPartnerInput
): Promise<{ error: string | null }> {
  const { error, data } = await supabase
    .from("partners")
    .insert({
      name: input.name,
      contact: input.contact || null,
      share_percent: input.sharePercent,
      notes: input.notes || null,
    })
    .select("id")
    .single();
  if (!error && data) {
    logActivity({
      action: "partner.created",
      entityType: "partner",
      entityId: String((data as { id: number }).id),
      details: { name: input.name, share: input.sharePercent },
    });
  }
  return { error: error?.message ?? null };
}

export async function deletePartner(id: number): Promise<{ error: string | null }> {
  const { error } = await supabase.from("partners").delete().eq("id", id);
  if (!error) {
    logActivity({
      action: "partner.deleted",
      entityType: "partner",
      entityId: String(id),
    });
  }
  return { error: error?.message ?? null };
}

export interface NewPayoutInput {
  partnerId: number;
  amount: number;
  paidAt?: string;
  notes?: string;
}

export async function createPayout(
  input: NewPayoutInput
): Promise<{ error: string | null }> {
  const { error, data } = await supabase
    .from("payouts")
    .insert({
      partner_id: input.partnerId,
      amount: input.amount,
      paid_at: input.paidAt ?? new Date().toISOString().slice(0, 10),
      notes: input.notes || null,
    })
    .select("id")
    .single();
  if (!error && data) {
    logActivity({
      action: "payout.created",
      entityType: "payout",
      entityId: String((data as { id: number }).id),
      details: { partner_id: input.partnerId, amount: input.amount },
    });
  }
  return { error: error?.message ?? null };
}

export async function deletePayout(id: number): Promise<{ error: string | null }> {
  const { error } = await supabase.from("payouts").delete().eq("id", id);
  if (!error) {
    logActivity({
      action: "payout.deleted",
      entityType: "payout",
      entityId: String(id),
    });
  }
  return { error: error?.message ?? null };
}
