import type { Metadata } from "next";
import AccountShell from "@/components/account/AccountShell";
import OrdersView from "@/components/account/OrdersView";
import { commerceProducts } from "@/lib/commerce-catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Orders",
  description: "Track and reorder your printengine orders.",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const products = await commerceProducts();
  return (
    <AccountShell active="orders" title="Orders" subtitle="Your recent orders">
      <OrdersView products={products} />
    </AccountShell>
  );
}
