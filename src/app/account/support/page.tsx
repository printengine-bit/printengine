import type { Metadata } from "next";
import AccountShell from "@/components/account/AccountShell";
import SupportView from "@/components/account/SupportView";

export const metadata: Metadata = {
  title: "Support",
  description: "Raise a ticket or track an existing one.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <AccountShell active="support" title="Support" subtitle="We usually reply within 2 hours">
      <SupportView />
    </AccountShell>
  );
}
