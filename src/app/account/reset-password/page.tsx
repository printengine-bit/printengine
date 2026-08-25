import type { Metadata } from "next";
import { Suspense } from "react";
import StorefrontShell from "@/components/layout/StorefrontShell";
import { ResetPassword } from "@/components/account/PasswordRecovery";

export const metadata: Metadata = { title: "Choose a new password", robots: { index: false, follow: false } };

export default function Page() {
  return <StorefrontShell><main id="main" className="container-pe py-16"><section className="mx-auto max-w-md border border-line bg-white p-7"><h1 className="text-[30px] font-medium tracking-[-0.03em]">Choose a new password</h1><Suspense fallback={<p className="mt-5 text-[14px] text-muted">Loading secure reset…</p>}><ResetPassword /></Suspense></section></main></StorefrontShell>;
}
