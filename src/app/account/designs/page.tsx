import type { Metadata } from "next";
import AccountShell from "@/components/account/AccountShell";
import DesignsView from "@/components/account/DesignsView";

export const metadata: Metadata = {
  title: "My designs",
  description: "Your saved AI, uploaded and text designs.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <AccountShell active="designs" title="My designs" subtitle="Reorder any of them on any garment">
      <DesignsView />
    </AccountShell>
  );
}
