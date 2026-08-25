"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AccountAccess() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <div className="mx-auto max-w-md border border-line bg-white p-6 text-left lg:p-8">
      <div className="flex border-b border-line">
        {(["login", "register"] as const).map((tab) => (
          <button key={tab} type="button" onClick={() => { setMode(tab); setError(null); }} className={`flex-1 border-b-2 py-3 text-[14px] ${mode === tab ? "border-lime text-ink" : "border-transparent text-muted"}`}>
            {tab === "login" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>
      <form className="mt-6 space-y-4" onSubmit={async (event) => {
        event.preventDefault(); setPending(true); setError(null);
        const data = Object.fromEntries(new FormData(event.currentTarget));
        const response = await fetch(`/api/auth/${mode === "login" ? "login" : "register"}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
        const result = await response.json() as { error?: string };
        if (!response.ok) { setError(result.error ?? "Could not continue."); setPending(false); return; }
        router.refresh();
      }}>
        {mode === "register" && <>
          <label className="block text-[13px]">Full name<input name="name" required autoComplete="name" className="mt-2 h-11 w-full border border-line px-3" /></label>
          <label className="block text-[13px]">Phone<input name="phone" type="tel" autoComplete="tel" className="mt-2 h-11 w-full border border-line px-3" /></label>
        </>}
        <label className="block text-[13px]">Email<input name="email" type="email" required autoComplete="email" className="mt-2 h-11 w-full border border-line px-3" /></label>
        <label className="block text-[13px]">Password<input name="password" type="password" minLength={mode === "register" ? 10 : 8} required autoComplete={mode === "register" ? "new-password" : "current-password"} className="mt-2 h-11 w-full border border-line px-3" /></label>
        {mode === "login" && <Link href="/account/forgot-password" className="inline-block text-[12px] underline underline-offset-4">Forgot password?</Link>}
        <button disabled={pending} className="h-12 w-full bg-lime text-btn disabled:opacity-50">{pending ? "Please wait…" : mode === "login" ? "Sign in" : "Create my account"}</button>
        {error && <p role="alert" className="text-[13px] text-[#a32d2d]">{error}</p>}
      </form>
    </div>
  );
}
