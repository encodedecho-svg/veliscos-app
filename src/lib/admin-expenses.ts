import { supabase } from "./supabase";
import { logActivity } from "./admin-activity";

export type ExpenseCategory =
  | "Operations"
  | "Marketing"
  | "Packaging"
  | "Shipping"
  | "Other";

export interface Expense {
  id: number;
  description: string;
  category: ExpenseCategory;
  amount: number;
  occurredAt: string;
  createdAt: string;
}

type Row = {
  id: number;
  description: string;
  category: ExpenseCategory;
  amount: number;
  occurred_at: string;
  created_at: string;
};

function rowToExpense(r: Row): Expense {
  return {
    id: r.id,
    description: r.description,
    category: r.category,
    amount: r.amount,
    occurredAt: r.occurred_at,
    createdAt: r.created_at,
  };
}

export async function listExpenses(): Promise<Expense[]> {
  const { data, error } = await supabase
    .from("expenses")
    .select("id, description, category, amount, occurred_at, created_at")
    .order("occurred_at", { ascending: false })
    .order("id", { ascending: false });
  if (error) {
    console.error("listExpenses:", error);
    return [];
  }
  return (data as Row[]).map(rowToExpense);
}

export interface NewExpenseInput {
  description: string;
  category: ExpenseCategory;
  amount: number;
  occurredAt?: string;
}

export async function createExpense(
  input: NewExpenseInput
): Promise<{ error: string | null }> {
  const { error, data } = await supabase
    .from("expenses")
    .insert({
      description: input.description,
      category: input.category,
      amount: input.amount,
      occurred_at: input.occurredAt ?? new Date().toISOString().slice(0, 10),
    })
    .select("id")
    .single();
  if (!error && data) {
    logActivity({
      action: "expense.created",
      entityType: "expense",
      entityId: String((data as { id: number }).id),
      details: { description: input.description, amount: input.amount, category: input.category },
    });
  }
  return { error: error?.message ?? null };
}

export async function deleteExpense(id: number): Promise<{ error: string | null }> {
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (!error) {
    logActivity({
      action: "expense.deleted",
      entityType: "expense",
      entityId: String(id),
    });
  }
  return { error: error?.message ?? null };
}
