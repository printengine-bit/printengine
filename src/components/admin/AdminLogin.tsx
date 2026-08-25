"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="mt-8 space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError(null);
        const data = new FormData(event.currentTarget);
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email: data.get("email"), password: data.get("password") }),
        });
        const result = (await response.json()) as { error?: string };
        if (!response.ok) {
          setError(result.error ?? "Sign in failed.");
          setPending(false);
          return;
        }
        router.replace("/admin");
        router.refresh();
      }}
    >
      <label className="block text-[13px]">
        Email
        <input name="email" type="email" required autoComplete="username" className="mt-2 h-12 w-full border border-line px-4 focus:border-ink focus:outline-none" />
      </label>
      <label className="block text-[13px]">
        Password
        <input name="password" type="password" minLength={8} required autoComplete="current-password" className="mt-2 h-12 w-full border border-line px-4 focus:border-ink focus:outline-none" />
      </label>
      <button disabled={pending} className="h-12 w-full bg-lime text-btn disabled:opacity-50">
        {pending ? "Signing in…" : "Sign in to administration"}
      </button>
      {error && <p className="text-[13px] text-[#a32d2d]" role="alert">{error}</p>}
    </form>
  );
}
