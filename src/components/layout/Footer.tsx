"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { submitLead } from "@/lib/leads";

const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Shop",
    links: [
      { label: "Men", href: "/shop?gender=Men" },
      { label: "Women", href: "/shop?gender=Women" },
      { label: "Kids", href: "/shop?gender=Kids" },
      { label: "All products", href: "/shop" },
      { label: "Bulk orders", href: "/bulk-orders" },
    ],
  },
  {
    heading: "Customise",
    links: [
      { label: "AI design studio", href: "/studio" },
      { label: "Upload artwork", href: "/studio?tab=upload" },
      { label: "Print areas guide", href: "/guides/print-areas" },
      { label: "Size chart", href: "/guides/size-chart" },
      { label: "Wash and care", href: "/guides/wash-care" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Track order", href: "/account/orders" },
      { label: "Raise a ticket", href: "/account/support" },
      { label: "Returns and refunds", href: "/policies/returns" },
      { label: "Shipping policy", href: "/policies/shipping" },
      { label: "Contact us", href: "/policies/contact" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About us", href: "/policies/about" },
      { label: "Careers", href: "/policies/careers" },
      { label: "Privacy policy", href: "/policies/privacy" },
      { label: "Terms of service", href: "/policies/terms" },
      { label: "GST and invoicing", href: "/guides/gst" },
    ],
  },
];

const PAYMENTS = ["UPI", "Visa", "Mastercard"];

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;

export default function Footer() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!EMAIL_RE.test(value)) {
      setErr("Enter a valid email address.");
      setMsg(null);
      return;
    }
    setErr(null);
    setSending(true);
    try {
      await submitLead({ type: "newsletter", email: value });
      setMsg("Thanks — check your inbox for your welcome offer.");
      setEmail("");
    } catch (error) {
      setMsg(null);
      setErr(error instanceof Error ? error.message : "We could not subscribe you right now.");
    } finally {
      setSending(false);
    }
  };

  return (
    <footer className="bg-ink text-white">
      <div className="container-pe">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-6 border-b border-white/10 py-12 lg:grid-cols-2 lg:items-center lg:gap-12">
          <div className="min-w-0">
            <p className="text-[24px] font-medium tracking-[-0.02em] lg:text-[28px]">
              Get ₹150 off your first order
            </p>
            <p className="mt-2 text-[14px] text-white/60">
              New drops, print ideas and early access to offers. No spam.
            </p>
          </div>
          <form
            onSubmit={subscribe}
            className="min-w-0 w-full max-w-md lg:ml-auto"
            aria-label="Newsletter signup"
          >
            <div className="flex">
              <label htmlFor="footer-email" className="sr-only">
                Email address
              </label>
              <input
                id="footer-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (err) setErr(null);
                }}
                placeholder="Email address"
                className="h-12 min-w-0 flex-1 border border-white/20 bg-transparent px-4 text-[14px] text-white placeholder:text-white/40 focus:border-white focus:outline-none"
              />
              <button
                type="submit"
                disabled={sending}
                className="h-12 shrink-0 bg-lime px-6 text-btn text-ink transition-opacity hover:opacity-90"
              >
                {sending ? "Sending…" : "Subscribe"}
              </button>
            </div>
            {err && <p className="mt-2 text-[13px] text-[#ffb4b4]">{err}</p>}
            {msg && (
              <p className="mt-2 text-[13px] text-lime" aria-live="polite">
                {msg}
              </p>
            )}
          </form>
        </div>

        <div className="grid grid-cols-2 gap-8 py-12 lg:grid-cols-5 lg:gap-6">
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center" aria-label="PrintEngine home">
              <Image
                src="/brand/printengine-dark.png"
                alt="PrintEngine"
                width={500}
                height={200}
                className="h-auto w-[148px]"
              />
            </Link>
            <p className="mt-3 max-w-56 text-[13px] leading-relaxed text-white/55">
              Custom print and embroidery, made to order in India.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <p className="mb-4 text-[11px] uppercase tracking-[0.12em] text-white/45">
                {col.heading}
              </p>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link
                      href={l.href}
                      className="text-[14px] text-white/80 underline-offset-4 hover:text-white hover:underline"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 py-6 text-[12px] text-white/50 lg:flex-row lg:items-center lg:justify-between">
          <p>© 2026 printengine. All rights reserved. Made to order in India.</p>
          <div className="flex items-center gap-3">
            {PAYMENTS.map((p) => (
              <span key={p} className="border border-white/15 px-2.5 py-1 text-[11px] text-white/70">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
