import { supabase } from "./supabase";

export interface ActivityEntry {
  id: number;
  actorEmail: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  details: Record<string, unknown> | null;
  createdAt: string;
}

interface LogInput {
  action: string;
  entityType?: string;
  entityId?: string;
  details?: Record<string, unknown>;
}

/** Fire-and-forget activity log. Failures don't block the calling operation. */
export async function logActivity(input: LogInput): Promise<void> {
  try {
    const { data } = await supabase.auth.getUser();
    const email = data.user?.email;
    if (!email) return;
    await supabase.from("activity_log").insert({
      actor_email: email,
      action: input.action,
      entity_type: input.entityType ?? null,
      entity_id: input.entityId ?? null,
      details: input.details ?? null,
    });
  } catch (err) {
    console.warn("logActivity failed", err);
  }
}

type Row = {
  id: number;
  actor_email: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
};

export async function listActivity(limit = 200): Promise<ActivityEntry[]> {
  const { data, error } = await supabase
    .from("activity_log")
    .select("id, actor_email, action, entity_type, entity_id, details, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("listActivity:", error);
    return [];
  }
  return (data as Row[]).map((r) => ({
    id: r.id,
    actorEmail: r.actor_email,
    action: r.action,
    entityType: r.entity_type,
    entityId: r.entity_id,
    details: r.details,
    createdAt: r.created_at,
  }));
}
