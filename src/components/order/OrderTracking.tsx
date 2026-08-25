"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Garment from "@/components/ui/Garment";
import DesignRender from "@/components/product/DesignRender";
import StagePhoto from "@/components/order/StagePhoto";
import CopyButton from "@/components/order/CopyButton";
import { productFor, type CartLine } from "@/lib/cart-store";
import { LIFECYCLE, order } from "@/lib/orders";
import { DEMO_MODE } from "@/lib/demo";

type PlacedOrder = {
  id: string;
  lines: CartLine[];
  totals: { total: number };
  placedAt: string;
};

export default function OrderTracking({ orderId }: { orderId: string }) {
  const [placed, setPlaced] = useState<PlacedOrder | null>(null);
  const [resolved, setResolved] = useState(DEMO_MODE && orderId === order.id);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const raw = localStorage.getItem("printengine.orders");
      if (!raw) return;
      const all = JSON.parse(raw) as PlacedOrder[];
      const match = all.find((o) => o && o.id === orderId);
      if (match) setPlaced(match);
    } catch {
      // Malformed local data is treated as no matching order.
    } finally {
      setResolved(true);
    }
  }, [orderId]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!resolved) {
    return <div className="container-pe py-20 text-center text-[14px] text-muted">Finding your order…</div>;
  }

  if (!placed && (!DEMO_MODE || orderId !== order.id)) {
    return (
      <div className="container-pe py-20 text-center">
        <h1 className="text-h1m">Order not found</h1>
        <p className="mt-3 text-[14px] text-muted">Sign in with the account used for this purchase or check the order number.</p>
        <Link href="/account/orders" className="mt-7 inline-flex h-12 items-center bg-lime px-8 text-btn text-ink">View my orders</Link>
      </div>
    );
  }

  const displayId = placed?.id ?? order.id;
  const placedOn = placed?.placedAt ?? order.placedOn;
  const lines = placed?.lines ?? order.lines;
  // A freshly placed order has only reached the artwork-check stage.
  const stage = placed ? 2 : order.currentStage;
  const status = placed ? "Artwork check" : order.status;
  const feed = placed
    ? [
        {
          title: "Artwork received, check in progress",
          when: "Just now",
          by: "Sunita, artwork check",
          kind: "check" as const,
        },
        {
          title: "Payment received",
          when: placed.placedAt,
          by: "Automated",
          kind: "receipt" as const,
        },
      ]
    : order.feed;

  return (
    <div className="container-pe space-y-6 py-8">
      <section className="flex flex-wrap items-start justify-between gap-4 border border-line p-5 lg:p-6">
        <div>
          <h1 className="text-[26px] font-medium tracking-[-0.02em] lg:text-[32px]">
            Order #{displayId}
          </h1>
          <p className="mt-1 text-[13px] text-muted">
            {lines.length} items · placed {placedOn}
          </p>
        </div>
        <span className="bg-lime px-3 py-1.5 text-[13px] font-medium text-ink">
          {status}
        </span>
      </section>

      <section className="border border-line p-5 lg:p-8" aria-label="Order progress">
        <ol className="flex flex-col gap-5 lg:flex-row lg:gap-0">
          {LIFECYCLE.map((s, i) => {
            const done = i < stage;
            const active = i === stage;
            return (
              <li
                key={s}
                className="relative flex items-center gap-3 lg:flex-1 lg:flex-col lg:gap-3 lg:text-center"
              >
                {i > 0 && (
                  <span
                    aria-hidden
                    className={
                      "absolute hidden lg:block " +
                      "left-[-50%] top-[7px] h-px w-full " +
                      (done || active ? "bg-ink" : "bg-line")
                    }
                  />
                )}
                {i > 0 && (
                  <span
                    aria-hidden
                    className={
                      "absolute left-[7px] top-[-20px] h-5 w-px lg:hidden " +
                      (done || active ? "bg-ink" : "bg-line")
                    }
                  />
                )}
                <span
                  aria-hidden
                  className={
                    "relative z-10 shrink-0 rounded-full " +
                    (active
                      ? "h-4 w-4 bg-lime ring-2 ring-ink"
                      : done
                        ? "h-3.5 w-3.5 bg-ink"
                        : "h-3.5 w-3.5 border border-line bg-white")
                  }
                />
                <span
                  className={
                    "relative z-10 text-[12px] leading-tight " +
                    (active ? "font-medium text-ink" : done ? "text-ink" : "text-muted")
                  }
                >
                  {s}
                  {active && <span className="sr-only"> (current stage)</span>}
                </span>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section className="min-w-0 border border-line p-5 lg:p-6" aria-labelledby="floor-heading">
          <h2 id="floor-heading" className="text-[20px] font-medium tracking-[-0.02em]">
            From the production floor
          </h2>
          <p className="mt-1.5 text-[14px] text-muted">
            We photograph your order at each stage so you can see it being made.
          </p>

          <ol className="mt-6">
            {feed.map((f, i) => {
              const last = i === feed.length - 1;
              return (
                <li key={f.title} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <StagePhoto kind={f.kind} className="h-20 w-20 shrink-0 border border-line" />
                    {!last && <span className="w-px flex-1 bg-line" aria-hidden />}
                  </div>
                  <div className={last ? "pt-1" : "pb-6 pt-1"}>
                    <p className="text-[15px]">{f.title}</p>
                    <p className="mt-1 text-[13px] text-muted">
                      {f.when} — {f.by}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <div className="min-w-0 space-y-6">
          <section className="border border-line p-5 lg:p-6">
            <h2 className="text-[16px] font-medium">Delivery details</h2>
            <div className="mt-4 space-y-1">
              <p className="text-[14px]">{order.address.name}</p>
              <p className="text-[14px] text-muted">{order.address.lines}</p>
              <p className="text-[13px] text-muted">{order.address.speed}</p>
            </div>
            <div className="mt-4 border border-line bg-alt p-4">
              <p className="text-[14px]">{order.courier}</p>
              <p className="mt-1 flex flex-wrap items-center gap-2 text-[13px] text-muted">
                AWB {order.awb}
                <CopyButton value={order.awb} label="tracking number" />
              </p>
              <p className="mt-2 text-[12px] text-muted">
                Tracking activates once your parcel is dispatched.
              </p>
            </div>
          </section>

          <section className="border border-line p-5 lg:p-6">
            <h2 className="text-[16px] font-medium">Something not right?</h2>
            <p className="mt-1.5 text-[14px] text-muted">
              Print quality, sizing, delivery — tell us and we will fix it.
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/account/support"
                className="flex h-11 flex-1 items-center justify-center border border-ink px-5 text-btn transition-colors hover:bg-ink hover:text-white"
              >
                Raise a ticket
              </Link>
              <a
                href="https://wa.me/919000000000"
                className="flex h-11 flex-1 items-center justify-center border border-ink px-5 text-btn transition-colors hover:bg-ink hover:text-white"
              >
                Chat on WhatsApp
              </a>
            </div>
          </section>
        </div>
      </div>

      <section className="border border-line p-5 lg:p-6" aria-labelledby="items-heading">
        <h2 id="items-heading" className="text-[20px] font-medium tracking-[-0.02em]">
          Items in this order
        </h2>
        <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {lines.map((l) => {
            const p = productFor(l.slug);
            if (!p) return null;
            return (
              <li key={l.id}>
                <div className="relative aspect-[4/5] bg-alt">
                  <Garment kind={p.kind} className="h-full w-full p-6" />
                  <ul className="absolute bottom-3 left-3 flex gap-1.5">
                    {l.designs.map((d) => (
                      <li key={d.area} className="h-9 w-9 border border-line bg-white p-1">
                        <DesignRender design={d.design} />
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="mt-4 text-[15px]">{p.name}</p>
                <p className="mt-1 text-[13px] text-muted">
                  {l.colour} · {l.size}
                </p>
                <p className="text-[13px] text-muted">
                  {l.method} ({l.designs.map((d) => d.label.toLowerCase()).join(", ")})
                </p>
                <Link
                  href={`/product/${p.slug}`}
                  className="mt-4 flex h-11 items-center justify-center border border-ink px-5 text-btn transition-colors hover:bg-ink hover:text-white"
                >
                  Reorder item
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
