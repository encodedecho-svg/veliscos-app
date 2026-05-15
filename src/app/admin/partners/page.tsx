import { AdminComingSoon } from "@/components/AdminComingSoon";

export default function AdminPartnersPage() {
  return (
    <AdminComingSoon
      title="Partner Settlements"
      description="Track profit shares, outstanding balances, and payout history per business partner."
      features={[
        "Configurable share allocation per partner",
        "Outstanding / paid amounts per period",
        "Settle-all-outstanding action",
        "Settlement history",
        "Printable settlement report",
      ]}
    />
  );
}
