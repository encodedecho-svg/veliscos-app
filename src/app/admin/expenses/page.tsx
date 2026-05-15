import { AdminComingSoon } from "@/components/AdminComingSoon";

export default function AdminExpensesPage() {
  return (
    <AdminComingSoon
      title="Expense Ledger"
      description="Operating costs that net against revenue when calculating profit."
      features={[
        "Add expenses (operations, marketing, packaging, shipping)",
        "Categorized ledger view",
        "Auto-aggregated into dashboard P&L",
      ]}
    />
  );
}
