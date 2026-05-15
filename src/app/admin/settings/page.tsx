import { AdminComingSoon } from "@/components/AdminComingSoon";

export default function AdminSettingsPage() {
  return (
    <AdminComingSoon
      title="System Configuration"
      description="Storefront settings stored as a config row in Supabase."
      features={[
        "Flat delivery rate (PKR)",
        "Free shipping threshold",
        "Brand contact info (email, phone, WhatsApp)",
        "Bank / JazzCash / Easypaisa payout details",
        "Admin email list management",
      ]}
    />
  );
}
