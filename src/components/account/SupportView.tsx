"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Repeat, Truck } from "@/components/ui/icons";
import {
  orderSummaries,
  tickets as initialTickets,
  TICKET_SUBJECTS,
  type TicketStatus,
} from "@/lib/account";
import { submitLead } from "@/lib/leads";

const chipClass = (s: TicketStatus) =>
  s === "Agent replied"
    ? "bg-lime text-ink"
    : s === "Open"
      ? "border border-ink text-ink"
      : "border border-line text-muted";

const HELP_LINKS = [
  { label: "How print areas work", href: "/guides/print-areas" },
  { label: "Artwork resolution guide", href: "/guides/artwork" },
  { label: "Wash and care", href: "/guides/wash-care" },
  { label: "Sizing and fit", href: "/guides/size-chart" },
  { label: "Shipping timelines", href: "/policies/shipping" },
  { label: "Returns policy", href: "/policies/returns" },
  { label: "Bulk order process", href: "/bulk-orders" },
  { label: "GST and invoicing", href: "/guides/gst" },
];

const QUICK = [
  {
    Icon: Truck,
    title: "Track an order",
    note: "See where your parcel is right now",
    href: "/account/orders",
  },
  {
    Icon: Repeat,
    title: "Return or exchange",
    note: "One free size exchange per order",
    href: "/policies/returns",
  },
];

const TICKETS_KEY = "printengine.tickets";

export default function SupportView() {
  const [tickets, setTickets] = useState(initialTickets);
  const [hydrated, setHydrated] = useState(false);

  // Tickets live in localStorage, readable only after mount.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(TICKETS_KEY);
      if (raw) setTickets(JSON.parse(raw) as typeof initialTickets);
    } catch {
      // keep the defaults
    }
    setHydrated(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
    } catch {
      // storage unavailable
    }
  }, [tickets, hydrated]);
  const [subject, setSubject] = useState<string | null>(null);
  const [orderId, setOrderId] = useState(orderSummaries[0].id);
  const [message, setMessage] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [openTicket, setOpenTicket] = useState<string | null>(null);

  const addPhotos = (files: FileList | null) => {
    if (!files) return;
    const names = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map((f) => f.name);
    if (names.length === 0) {
      setError("Only image files can be attached.");
      return;
    }
    setError(null);
    setPhotos((prev) => [...prev, ...names].slice(0, 4));
  };

  const submit = async () => {
    if (!subject) {
      setError("Choose what this is about.");
      return;
    }
    if (message.trim().length < 10) {
      setError("Tell us a little more — at least a sentence.");
      return;
    }
    setError(null);
    setSending(true);
    const id = "TK-" + Date.now().toString().slice(-6);
    try {
      await submitLead({ type: "support", ticketId: id, subject, orderId, message: message.trim(), photos });
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "We could not submit this ticket.");
      setSending(false);
      return;
    }
    setTickets((prev) => [
      {
        id,
        subject: `${subject} — ${message.trim().slice(0, 40)}`,
        order: orderId,
        opened: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
        status: "Open" as TicketStatus,
      },
      ...prev,
    ]);
    setSubject(null);
    setMessage("");
    setPhotos([]);
    setDone(true);
    setSending(false);
  };

  return (
    <>
      <ul className="grid gap-4 sm:grid-cols-3">
        {QUICK.map(({ Icon, title, note, href }) => (
          <li key={title}>
            <Link
              href={href}
              className="flex h-full w-full flex-col items-start border border-line p-5 text-left transition-colors hover:border-ink"
            >
              <Icon className="h-5 w-5 text-ink" />
              <span className="mt-3 text-[15px]">{title}</span>
              <span className="mt-1 text-[13px] text-muted">{note}</span>
            </Link>
          </li>
        ))}
        <li>
          <a
            href="https://wa.me/919000000000"
            className="flex h-full w-full flex-col items-start border border-line p-5 text-left transition-colors hover:border-ink"
          >
            <ArrowRight className="h-5 w-5 text-ink" />
            <span className="mt-3 text-[15px]">Chat on WhatsApp</span>
            <span className="mt-1 text-[13px] text-muted">Fastest for urgent order issues</span>
          </a>
        </li>
      </ul>

      <section className="mt-9">
        <h2 className="text-[16px] font-medium">Your tickets</h2>
        <ul className="mt-4 border border-line">
          {tickets.map((t, i) => (
            <li key={t.id} className={i > 0 ? "border-t border-line" : ""}>
              <button
                type="button"
                onClick={() => setOpenTicket(openTicket === t.id ? null : t.id)}
                aria-expanded={openTicket === t.id}
                className="flex w-full flex-wrap items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-alt"
              >
                <span className="min-w-0">
                  <span className="block text-[15px]">
                    #{t.id} · {t.subject}
                  </span>
                  <span className="mt-1 block text-[13px] text-muted">
                    Linked to order #{t.order} · opened {t.opened}
                  </span>
                </span>
                <span className={"shrink-0 px-3 py-1 text-[12px] font-medium " + chipClass(t.status)}>
                  {t.status}
                </span>
              </button>
              {openTicket === t.id && (
                <div className="border-t border-line bg-alt px-4 py-4">
                  <p className="text-[13px] leading-relaxed text-muted">
                    {t.status === "Agent replied"
                      ? "Sunita from the artwork team replied: we have approved a free reprint and it goes on the press today. No action needed from you."
                      : t.status === "Open"
                        ? "We have received this and are checking it against your order. We usually reply within 2 hours."
                        : "This ticket was resolved and closed. Reply below if it comes back."}
                  </p>
                  <Link
                    href={`/order/${t.order}`}
                    className="mt-3 inline-block text-[13px] underline underline-offset-4"
                  >
                    View order #{t.order}
                  </Link>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-9 border border-line bg-alt p-5 lg:p-6">
        <h2 className="text-[16px] font-medium">Raise a new ticket</h2>

        <div className="mt-5">
          <span className="mb-2 block text-[13px] text-muted">What is this about?</span>
          <div className="flex flex-wrap gap-2">
            {TICKET_SUBJECTS.map((s) => {
              const on = subject === s;
              return (
                <button
                  key={s}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    setSubject(s);
                    setError(null);
                    setDone(false);
                  }}
                  className={
                    "border px-4 py-2 text-[13px] transition-colors " +
                    (on ? "border-lime bg-lime text-ink" : "border-line bg-white hover:border-ink")
                  }
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        <label className="mt-5 block">
          <span className="mb-2 block text-[13px] text-muted">Which order?</span>
          <select
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="h-11 w-full border border-line bg-white px-3 text-[14px] focus:border-ink focus:outline-none sm:max-w-sm"
          >
            {orderSummaries.map((o) => (
              <option key={o.id} value={o.id}>
                Order #{o.id} — {o.itemCount} {o.itemCount === 1 ? "item" : "items"}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-5 block">
          <span className="mb-2 block text-[13px] text-muted">Tell us what happened</span>
          <textarea
            rows={4}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              if (error) setError(null);
              setDone(false);
            }}
            placeholder="Describe the issue in a sentence or two"
            className="w-full resize-none border border-line bg-white px-3 py-2.5 text-[14px] focus:border-ink focus:outline-none"
          />
        </label>

        <div className="mt-5">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-2 border border-dashed border-muted bg-white px-4 py-8 text-center transition-colors hover:border-ink"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6 text-muted"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden
            >
              <path d="M4 8h3l2-2h6l2 2h3v11H4Z" />
              <circle cx="12" cy="13" r="3.5" />
            </svg>
            <span className="text-[14px]">Add photos of the item</span>
            <span className="max-w-md text-[12px] leading-relaxed text-muted">
              A photo of the print lets us approve a reprint straight away, without any back and
              forth.
            </span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => addPhotos(e.target.files)}
          />
          {photos.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {photos.map((p, i) => (
                <li
                  key={p + i}
                  className="flex items-center gap-2 border border-line bg-white px-3 py-1.5 text-[12px]"
                >
                  {p}
                  <button
                    type="button"
                    onClick={() => setPhotos((prev) => prev.filter((_, x) => x !== i))}
                    aria-label={`Remove ${p}`}
                    className="text-muted hover:text-ink"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && <p className="mt-3 text-[13px] text-[#a32d2d]">{error}</p>}
        {done && (
          <p className="mt-3 text-[13px] text-[#5f7f06]" aria-live="polite">
            Ticket raised — we usually reply within 2 hours.
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={submit}
            disabled={sending}
            className="h-12 bg-ink px-8 text-btn text-white transition-opacity hover:opacity-90"
          >
            {sending ? "Submitting…" : "Submit ticket"}
          </button>
          <p className="text-[13px] text-muted">
            Or{" "}
            <a href="https://wa.me/919000000000" className="underline underline-offset-4">
              chat with us on WhatsApp
            </a>
          </p>
        </div>
      </section>

      <section className="mt-9">
        <h2 className="text-[16px] font-medium">Help topics</h2>
        <ul className="mt-4 grid border-t border-line sm:grid-cols-2">
          {HELP_LINKS.map((t) => (
            <li key={t.href} className="border-b border-line">
              <Link
                href={t.href}
                className="flex items-center justify-between gap-3 py-4 pr-2 text-[14px] transition-colors hover:text-ink sm:pr-6"
              >
                {t.label}
                <ArrowRight className="h-4 w-4 shrink-0 text-muted" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
