"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const [confirming, setConfirming] = useState(false);
  const router = useRouter();

  const signOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    try {
      localStorage.removeItem("printengine.cart.v2");
      localStorage.removeItem("printengine.wishlist.v2");
      localStorage.removeItem("printengine.coupon.v2");
      localStorage.removeItem("printengine.lastOrder");
      localStorage.removeItem("printengine.orders");
      localStorage.removeItem("printengine.sizeProfile");
    } catch {
      // storage unavailable — nothing to clear
    }
    router.push("/");
    router.refresh();
  };

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="px-4 text-[14px] text-muted transition-colors hover:text-ink"
      >
        Sign out
      </button>
    );
  }

  return (
    <div className="px-4">
      <p className="text-[13px] text-muted">Sign out and clear this device?</p>
      <div className="mt-2 flex gap-3">
        <button
          type="button"
          onClick={signOut}
          className="text-[13px] text-[#a32d2d] underline underline-offset-4"
        >
          Yes, sign out
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="text-[13px] text-muted underline underline-offset-4"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
