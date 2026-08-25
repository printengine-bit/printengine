import type { Metadata } from "next";
import AccountShell from "@/components/account/AccountShell";
import OrdersView from "@/components/account/OrdersView";

export const metadata: Metadata = {
  title: "Orders",
  description: "Track and reorder your printengine orders.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <AccountShell active="orders" title="Orders" subtitle="Your recent orders">
      <OrdersView />
    </AccountShell>
  );
}
