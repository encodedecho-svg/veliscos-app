import { AdminComingSoon } from "@/components/AdminComingSoon";

export default function AdminAnalyticsPage() {
  return (
    <AdminComingSoon
      title="Insights"
      description="Charts and trends powered by Chart.js, driven by your order history."
      features={[
        "Revenue trend over time",
        "Top products sold",
        "Orders by city",
        "Sales by category",
        "Order status breakdown",
        "Payment method split",
        "Average order value trend",
      ]}
    />
  );
}
