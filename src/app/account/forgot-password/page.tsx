import type { Metadata } from "next";
import StorefrontShell from "@/components/layout/StorefrontShell";
import { ForgotPassword } from "@/components/account/PasswordRecovery";

export const metadata: Metadata = { title: "Reset password", robots: { index: false, follow: false } };

export default function Page() {
  return <StorefrontShell><main id="main" className="container-pe py-16"><section className="mx-auto max-w-md border border-line bg-white p-7"><h1 className="text-[30px] font-medium tracking-[-0.03em]">Reset your password</h1><p className="mt-2 text-[14px] text-muted">We will email a secure one-hour reset link.</p><ForgotPassword /></section></main></StorefrontShell>;
}
