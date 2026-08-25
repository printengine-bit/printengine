"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  return <form className="mt-7 space-y-4" onSubmit={async (event) => {
    event.preventDefault(); setPending(true);
    const response = await fetch("/api/auth/forgot-password", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email }) });
    const result = await response.json() as { error?: string };
    setMessage(response.ok ? "If that account exists, a reset link is on its way." : result.error || "Please try again later.");
    setPending(false);
  }}>
    <label className="block text-[13px]">Account email<input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 h-11 w-full border border-line px-3" /></label>
    <button disabled={pending} className="h-12 w-full bg-lime text-btn disabled:opacity-50">{pending ? "Sending…" : "Send reset link"}</button>
    {message && <p className="text-[13px] leading-relaxed text-muted" role="status">{message}</p>}
    <Link href="/account" className="inline-block text-[12px] underline underline-offset-4">Return to sign in</Link>
  </form>;
}

export function ResetPassword() {
  const token = useSearchParams().get("token") || "";
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  return <form className="mt-7 space-y-4" onSubmit={async (event) => {
    event.preventDefault(); setPending(true); setError(null);
    const response = await fetch("/api/auth/reset-password", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token, password }) });
    const result = await response.json() as { error?: string };
    if (!response.ok) { setError(result.error || "The password could not be changed."); setPending(false); return; }
    router.push("/account?password=reset");
  }}>
    <label className="block text-[13px]">New password<input type="password" required minLength={10} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 h-11 w-full border border-line px-3" /></label>
    <p className="text-[12px] text-muted">Use at least 10 characters and avoid reusing another account’s password.</p>
    <button disabled={pending || !token} className="h-12 w-full bg-lime text-btn disabled:opacity-50">{pending ? "Updating…" : "Set new password"}</button>
    {!token && <p className="text-[13px] text-[#a32d2d]">This reset link is incomplete.</p>}
    {error && <p className="text-[13px] text-[#a32d2d]" role="alert">{error}</p>}
  </form>;
}
