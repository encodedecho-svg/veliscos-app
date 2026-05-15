import { AdminComingSoon } from "@/components/AdminComingSoon";

export default function AdminMarketingPage() {
  return (
    <AdminComingSoon
      title="Marketing & Promos"
      description="Storefront announcement banner plus promo-code management."
      features={[
        "Scrolling announcement banner (text + color + active toggle)",
        "Promo codes (% or fixed PKR)",
        "Validity dates, max uses, min order amount",
        "Code usage stats",
      ]}
    />
  );
}
