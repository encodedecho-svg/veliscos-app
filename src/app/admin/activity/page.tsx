import { AdminComingSoon } from "@/components/AdminComingSoon";

export default function AdminActivityPage() {
  return (
    <AdminComingSoon
      title="Activity Log"
      description="Audit trail of admin actions — who changed what, and when."
      features={[
        "Order status changes",
        "Product creates / edits / deletes",
        "Settings updates",
        "Login / logout events",
      ]}
    />
  );
}
