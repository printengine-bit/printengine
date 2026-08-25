"use client";

import { useState } from "react";

export default function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // clipboard unavailable — still show feedback so the value can be selected manually
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy ${label}`}
      className="inline-flex items-center gap-1.5 text-[12px] text-muted underline-offset-4 hover:text-ink hover:underline"
    >
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <rect x="9" y="9" width="11" height="11" />
        <path d="M5 15V5h10" />
      </svg>
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
