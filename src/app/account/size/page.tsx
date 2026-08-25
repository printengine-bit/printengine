import type { Metadata } from "next";
import AccountShell from "@/components/account/AccountShell";
import SizeProfileView from "@/components/account/SizeProfileView";

export const metadata: Metadata = {
  title: "Size profile",
  description: "Save your sizes and fit preference.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <AccountShell active="size" title="Size profile" subtitle="We use this to pre-select your size and cut down on exchanges">
      <SizeProfileView />
    </AccountShell>
  );
}
