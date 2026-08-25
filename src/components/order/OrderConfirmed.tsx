"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Garment from "@/components/ui/Garment";
import DesignRender from "@/components/product/DesignRender";
import { Truck } from "@/components/ui/icons";
import { inr } from "@/lib/catalog";
import { lineTotal, productFor, type CartLine } from "@/lib/cart-store";
import { allDesigns, order, orderTotals } from "@/lib/orders";
import { buildInvoice, downloadText } from "@/lib/invoice";
import { DEMO_MODE } from "@/lib/demo";

type PlacedOrder = {
  id: string;
  lines: CartLine[];
  totals: { subtotal: number; decoration: number; discount: number; shipping: number; total: number };
  coupon: string | null;
  speed: string;
  placedAt: string;
  accessToken?:string;
  address?:Record<string,string>;
};

export default function OrderConfirmed({ orderId,accessToken }: { orderId: string;accessToken?:string }) {
  const [placed, setPlaced] = useState<PlacedOrder | null>(null);
  const [resolved, setResolved] = useState(DEMO_MODE && orderId === order.id);

  useEffect(() => {
    const load=async()=>{try{
      const query=accessToken?`?access=${encodeURIComponent(accessToken)}`:"";
      const response=await fetch(`/api/orders/${encodeURIComponent(orderId)}${query}`,{cache:"no-store"});
      if(response.ok){const result=await response.json() as {order?:PlacedOrder};if(result.order){setPlaced({...result.order,accessToken});return;}}
      const raw=localStorage.getItem("printengine.lastOrder");if(raw){const parsed=JSON.parse(raw) as PlacedOrder;if(parsed.id===orderId)setPlaced(parsed);}
    }catch{}finally{setResolved(true);}};void load();
  }, [orderId,accessToken]);

  if (!resolved) {
    return <div className="container-pe py-20 text-center text-[14px] text-muted">Confirming your order…</div>;
  }

  if (!placed && (!DEMO_MODE || orderId !== order.id)) {
    return (
      <div className="container-pe py-20 text-center">
        <h1 className="text-h1m">Confirmation not found</h1>
        <p className="mt-3 text-[14px] text-muted">This link does not match an order in this account.</p>
        <Link href="/account/orders" className="mt-7 inline-flex h-12 items-center bg-lime px-8 text-btn text-ink">View my orders</Link>
      </div>
    );
  }

  const sample = orderTotals();
  const lines = placed?.lines ?? order.lines;
  const subtotal = placed?.totals.subtotal ?? sample.subtotal;
  const decoration = placed?.totals.decoration ?? sample.decoration;
  const total = placed?.totals.total ?? sample.total;
  const discount = placed?.totals.discount ?? order.discount;
  const shipping = placed?.totals.shipping ?? 0;
  const couponCode = placed ? placed.coupon : order.coupon;
  const displayId = placed?.id ?? order.id;
  const placedOn = placed?.placedAt ?? order.placedOn;
  const designThumbs = placed
    ? placed.lines.flatMap((l) => l.designs.map((d) => ({ key: l.id + d.area, design: d.design })))
    : allDesigns;

  return (
    <>
      <section className="bg-alt">
        <div className="container-pe flex flex-col items-center py-16 text-center lg:py-20">
          <span className="flex h-14 w-14 items-center justify-center bg-lime" aria-hidden>
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="#0a0a0a" strokeWidth="2.5">
              <path d="M5 12.5l5 5L19 7" />
            </svg>
          </span>
          <h1 className="mt-7 text-h1m lg:text-h1">Order confirmed</h1>
          <p className="mt-3 text-[14px] text-muted">
            Order #{displayId} · placed on {placedOn}
          </p>
          <p className="mt-4 max-w-md text-[15px]">Your receipt and production updates are available in your account.</p>
        </div>
      </section>

      <div className="container-pe">
        <div className="mt-10 flex flex-col gap-4 border border-line p-5 sm:flex-row lg:p-6">
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6 shrink-0 text-ink"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden
          >
            <path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6-10-6-10-6Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <div>
            <h2 className="text-[16px] font-medium">Your artwork is being checked</h2>
            <p className="mt-1.5 max-w-3xl text-[14px] leading-relaxed text-muted">
              A member of our team reviews every design before printing. If the resolution is too
              low for a sharp print, we will contact you within 4 hours before anything goes on the
              press.
            </p>
            <Link href="/cart" className="mt-3 inline-block text-[13px] underline underline-offset-4">
              Review my designs
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          <div className="min-w-0 space-y-6">
            <section className="border border-line p-5 lg:p-6">
              <h2 className="text-[16px] font-medium">What happens next</h2>
              <ol className="mt-6">
                {order.nextSteps.map((s, i) => {
                  const active = i === 0;
                  const last = i === order.nextSteps.length - 1;
                  return (
                    <li key={s.title} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <span
                          className={
                            "flex h-12 w-12 shrink-0 flex-col items-center justify-center leading-none " +
                            (active ? "bg-lime text-ink" : "bg-alt text-muted")
                          }
                        >
                          <span className="text-[14px] font-medium">{s.date}</span>
                          <span className="mt-0.5 text-[10px]">{s.month}</span>
                        </span>
                        {!last && <span className="w-px flex-1 bg-line" aria-hidden />}
                      </div>
                      <div className={last ? "pb-0 pt-2" : "pb-7 pt-2"}>
                        <p className="flex flex-wrap items-center gap-2 text-[15px]">
                          {s.title}
                          {active && (
                            <span className="bg-lime px-2 py-0.5 text-[11px] font-medium text-ink">
                              Today
                            </span>
                          )}
                        </p>
                        <p className="mt-1 text-[13px] text-muted">{s.note}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>

            <section className="border border-line p-5 lg:p-6">
              <div className="flex gap-4">
                <Truck className="h-6 w-6 shrink-0 text-muted" />
                <div>
                  <h2 className="text-[20px] font-medium tracking-[-0.02em]">
                    Arriving by {order.eta}
                  </h2>
                  <p className="mt-2 text-[14px]">{placed?.address?.name??order.address.name}</p>
                  <p className="text-[14px] text-muted">{placed?.address?`${placed.address.line1}${placed.address.line2?`, ${placed.address.line2}`:""}, ${placed.address.city}, ${placed.address.state} ${placed.address.postalCode}`:order.address.lines}</p>
                  <p className="mt-1 text-[13px] text-muted">{order.address.speed}</p>
                </div>
              </div>
            </section>
          </div>

          <aside className="min-w-0">
            <div className="border border-line p-5 lg:p-6">
              <h2 className="text-[16px] font-medium">Order summary</h2>

              <ul className="mt-5 space-y-4 border-t border-line pt-5">
                {lines.map((l) => {
                  const p = productFor(l.slug);
                  if (!p) return null;
                  return (
                    <li key={l.id} className="flex gap-3">
                      <div className="relative h-16 w-14 shrink-0 bg-alt">
                        <Garment kind={p.kind} className="h-full w-full p-1.5" />
                        <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center bg-ink text-[11px] text-white">
                          {l.qty}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] leading-snug">{p.name}</p>
                        <p className="text-[12px] text-muted">
                          {l.colour} · {l.size} · {l.method}
                        </p>
                        <ul className="mt-1.5 flex gap-1.5">
                          {l.designs.map((d) => (
                            <li key={d.area} className="h-6 w-6 border border-line bg-white p-0.5">
                              <DesignRender design={d.design} />
                            </li>
                          ))}
                        </ul>
                      </div>
                      <p className="shrink-0 text-[14px]">{inr(lineTotal(l))}</p>
                    </li>
                  );
                })}
              </ul>

              <dl className="mt-5 space-y-2.5 border-t border-line pt-5 text-[14px]">
                <div className="flex justify-between">
                  <dt className="text-muted">Subtotal</dt>
                  <dd>{inr(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Decoration charges</dt>
                  <dd>{inr(decoration)}</dd>
                </div>
                {couponCode && discount > 0 && (
                  <div className="flex justify-between text-[#5f7f06]">
                    <dt>Coupon ({couponCode})</dt>
                    <dd>−{inr(discount)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-muted">Delivery</dt>
                  <dd className={shipping === 0 ? "text-[#5f7f06]" : ""}>
                    {shipping === 0 ? "Free" : inr(shipping)}
                  </dd>
                </div>
              </dl>

              <div className="mt-5 flex items-baseline justify-between border-t border-line pt-5">
                <span className="text-[15px]">Total paid</span>
                <span className="text-[18px] font-medium">{inr(total)}</span>
              </div>
              <p className="mt-1 text-right text-[12px] text-muted">Paid via {order.payment}</p>

              <button
                type="button"
                onClick={() =>
                  downloadText(
                    `printengine-invoice-${displayId}.txt`,
                    buildInvoice({
                      orderId: displayId,
                      placedOn,
                      lines: lines.map((l) => {
                        const p = productFor(l.slug);
                        return {
                          name: p?.name ?? l.slug,
                          detail: `${l.colour} / ${l.size} / ${l.method}`,
                          qty: l.qty,
                          amount: (p?.price ?? 0) * l.qty,
                        };
                      }),
                      subtotal,
                      decoration,
                      discount,
                      shipping,
                      total,
                    })
                  )
                }
                className="mt-4 flex w-full items-center justify-center gap-2 text-[13px] underline underline-offset-4"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                  <path d="M12 4v11m0 0l-4-4m4 4l4-4M5 19h14" />
                </svg>
                Download invoice
              </button>
            </div>
          </aside>
        </div>

        <section className="mt-6 flex flex-col gap-5 border border-line bg-alt p-5 sm:flex-row sm:items-center lg:p-6">
          <div className="flex-1">
            <h2 className="text-[16px] font-medium">Your designs are saved</h2>
            <p className="mt-1 text-[14px] text-muted">Reorder them on any garment, any time.</p>
            <ul className="mt-4 flex gap-2">
              {designThumbs.map((d) => (
                <li key={d.key} className="h-12 w-12 border border-line bg-white p-1">
                  <DesignRender design={d.design} />
                </li>
              ))}
            </ul>
          </div>
          <Link
            href="/account/designs"
            className="flex h-11 shrink-0 items-center justify-center border border-ink px-6 text-btn transition-colors hover:bg-ink hover:text-white"
          >
            View my designs
          </Link>
        </section>

        <div className="my-12 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href={`/order/${displayId}${accessToken?`?access=${encodeURIComponent(accessToken)}`:""}`}
            className="flex h-12 items-center justify-center bg-lime px-8 text-btn text-ink transition-opacity hover:opacity-90"
          >
            Track your order
          </Link>
          <Link
            href="/shop"
            className="flex h-12 items-center justify-center border border-ink px-8 text-btn transition-colors hover:bg-ink hover:text-white"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </>
  );
}
