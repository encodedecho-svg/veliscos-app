import { supabase } from "./supabase";
import { logActivity } from "./admin-activity";

export interface StaffMember {
  email: string;
  createdAt: string;
}

export async function listStaff(): Promise<StaffMember[]> {
  const { data, error } = await supabase
    .from("admin_emails")
    .select("email, created_at")
    .order("created_at", { ascending: true });
  if (error) {
    console.error("listStaff:", error);
    return [];
  }
  return (data as { email: string; created_at: string }[]).map((r) => ({
    email: r.email,
    createdAt: r.created_at,
  }));
}

export async function addStaff(email: string): Promise<{ error: string | null }> {
  const normalized = email.trim().toLowerCase();
  if (!normalized.includes("@")) return { error: "Invalid email." };
  const { error } = await supabase
    .from("admin_emails")
    .insert({ email: normalized });
  if (!error) {
    logActivity({
      action: "staff.added",
      entityType: "staff",
      entityId: normalized,
    });
  }
  return { error: error?.message ?? null };
}

export async function removeStaff(email: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from("admin_emails").delete().eq("email", email);
  if (!error) {
    logActivity({
      action: "staff.removed",
      entityType: "staff",
      entityId: email,
    });
  }
  return { error: error?.message ?? null };
}
