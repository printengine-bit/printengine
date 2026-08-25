import type { Metadata } from "next";
import AccountShell from "@/components/account/AccountShell";
import WishlistView from "@/components/account/WishlistView";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Products you have saved for later.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <AccountShell active="wishlist" title="Wishlist" subtitle="4 items saved">
      <WishlistView />
    </AccountShell>
  );
}
