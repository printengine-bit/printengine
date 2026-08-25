import type { Metadata } from "next";
import AccountShell from "@/components/account/AccountShell";
import AddressesView from "@/components/account/AddressesView";

export const metadata: Metadata = {
  title: "Addresses",
  description: "Manage your saved delivery addresses.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <AccountShell active="addresses" title="Addresses" subtitle="3 saved addresses">
      <AddressesView />
    </AccountShell>
  );
}
