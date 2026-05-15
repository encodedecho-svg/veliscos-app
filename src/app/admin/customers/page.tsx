import { AdminComingSoon } from "@/components/AdminComingSoon";

export default function AdminCustomersPage() {
  return (
    <AdminComingSoon
      title="Customers"
      description="Derived from your order history: who they are, what they bought, and lifetime value."
      features={[
        "Segments (VIP / New / Returning / At-risk)",
        "Phone, email, city directory",
        "Orders count & LTV per customer",
        "Sortable columns + CSV export",
        "Date range and search filters",
      ]}
    />
  );
}
