import type { Metadata } from "next";
import AccountShell from "@/components/account/AccountShell";
import WishlistView from "@/components/account/WishlistView";
import { commerceProducts } from "@/lib/commerce-catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Products you have saved for later.",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const products = await commerceProducts();
  return (
    <AccountShell active="wishlist" title="Wishlist" subtitle="4 items saved">
      <WishlistView products={products} />
    </AccountShell>
  );
}
