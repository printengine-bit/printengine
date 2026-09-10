"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Garment from "@/components/ui/Garment";
import DesignRender from "@/components/product/DesignRender";
import { inr, type Product } from "@/lib/catalog";
import { orderSummaries, type OrderStatus, type OrderSummary } from "@/lib/account";
import { productFor, useCart, type CartLine } from "@/lib/cart-store";
import { buildInvoice, downloadText } from "@/lib/invoice";

type PlacedOrder = {
  id: string;
  lines: CartLine[];
  totals: { total: number };
  placedAt: string;
};

const TABS = ["All", "In progress", "Delivered", "Cancelled"] as const;
type Tab = (typeof TABS)[number];

const chipClass = (s: OrderStatus) =>
  s === "In printing"
    ? "bg-lime text-ink"
    : s === "Delivered"
      ? "border border-ink text-ink"
      : "border border-line text-muted";

export default function OrdersView({ products }: { products: Product[] }) {
  const [tab, setTab] = useState<Tab>("All");
  const [placed, setPlaced] = useState<OrderSummary[]>([]);
  const [raw, setRaw] = useState<PlacedOrder[]>([]);
  const [note, setNote] = useState<string | null>(null);
  const [rating, setRating] = useState<Record<string, number>>({});
  const { addLine } = useCart();

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetch("/api/account/orders").then(response=>response.ok?response.json():{orders:[]}).then((result:{orders?:OrderSummary[]})=>setPlaced(result.orders??[])).catch(()=>setPlaced([]));
    try { const stored = localStorage.getItem("printengine.orders"); if(stored){const parsed=JSON.parse(stored) as PlacedOrder[];setRaw(parsed.filter(order=>order&&order.id&&order.lines?.length));} } catch {}
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const all = [...placed, ...(process.env.NEXT_PUBLIC_ENABLE_DEMO_DATA === "true" ? orderSummaries : [])];

  const reorder = (o: OrderSummary) => {
    const stored = raw.find((r) => r.id === o.id);
    if (stored) {
      stored.lines.forEach((l) => addLine({ ...l, qty: l.qty }));
      setNote(`Added ${stored.lines.length} item${stored.lines.length === 1 ? "" : "s"} from #${o.id} back to your cart.`);
      return;
    }
    let added = 0;
    o.thumbs.forEach((t) => {
      const p = productFor(t.slug, products);
      if (!p) return;
      addLine({
        slug: p.slug,
        colour: p.colours[0],
        size: p.sizes.includes("M") ? "M" : p.sizes[0],
        method: p.methods[0],
        designs: [{ area: "front", label: "Front", design: t.design }],
        qty: 1,
      });
      added += 1;
    });
    setNote(`Added ${added} item${added === 1 ? "" : "s"} from #${o.id} back to your cart.`);
  };

  const invoice = (o: OrderSummary) => {
    const stored = raw.find((r) => r.id === o.id);
    const lines = stored
      ? stored.lines.map((l) => {
          const p = productFor(l.slug, products);
          return {
            name: p?.name ?? l.slug,
            detail: `${l.colour} / ${l.size} / ${l.method}`,
            qty: l.qty,
            amount: (p ? p.price : 0) * l.qty,
          };
        })
      : o.thumbs.map((t) => {
          const p = productFor(t.slug, products);
          return {
            name: p?.name ?? t.slug,
            detail: "As ordered",
            qty: 1,
            amount: p?.price ?? 0,
          };
        });
    const subtotal = lines.reduce((s2, l) => s2 + l.amount, 0);
    const text = buildInvoice({
      orderId: o.id,
      placedOn: o.placedOn,
      lines,
      subtotal,
      decoration: Math.max(0, o.total - subtotal),
      discount: 0,
      shipping: 0,
      total: o.total,
    });
    downloadText(`printengine-invoice-${o.id}.txt`, text);
    setNote(`Invoice for #${o.id} downloaded.`);
  };

  const list = all.filter((o) => {
    if (tab === "All") return true;
    if (tab === "In progress") return o.status === "In printing";
    return o.status === tab;
  });

  return (
    <>
      <div className="no-scrollbar flex gap-2 overflow-x-auto" role="group" aria-label="Filter orders">
        {TABS.map((t) => {
          const on = tab === t;
          return (
            <button
              key={t}
              type="button"
              aria-pressed={on}
              onClick={() => setTab(t)}
              className={
                "shrink-0 border-b-2 px-1 pb-2 text-[14px] transition-colors " +
                (on ? "border-lime text-ink" : "border-transparent text-muted hover:text-ink")
              }
            >
              {t}
            </button>
          );
        })}
      </div>

      <p className="sr-only" aria-live="polite">
        {list.length} orders shown
      </p>

      {note && (
        <p className="mt-4 border border-line bg-alt px-4 py-3 text-[13px] text-[#5f7f06]" aria-live="polite">
          {note}
        </p>
      )}

      {list.length === 0 ? (
        <div className="mt-8 border border-line px-6 py-16 text-center">
          <p className="text-[16px]">No orders here yet</p>
          <p className="mt-2 text-[14px] text-muted">
            Orders with this status will appear here once you have one.
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-5">
          {list.map((o) => (
            <li key={o.id} className="border border-line">
              <div className="flex flex-wrap items-start justify-between gap-3 bg-alt px-5 py-4">
                <div>
                  <p className="text-[15px]">Order #{o.id}</p>
                  <p className="mt-1 text-[13px] text-muted">
                    Placed {o.placedOn} · {o.itemCount}{" "}
                    {o.itemCount === 1 ? "item" : "items"} ·{" "}
                    <span className={o.status === "Cancelled" ? "line-through" : ""}>
                      {inr(o.total)}
                    </span>
                  </p>
                </div>
                <span className={"px-3 py-1 text-[12px] font-medium " + chipClass(o.status)}>
                  {o.status}
                </span>
              </div>

              <div className="px-5 py-5">
                <ul className="flex flex-wrap gap-3">
                  {o.thumbs.map((t, i) => {
                    const p = products.find((x) => x.slug === t.slug);
                    if (!p) return null;
                    return (
                      <li key={i} className="relative h-[72px] w-[72px] bg-alt">
                        <Garment kind={p.kind} className="h-full w-full p-2" />
                        <span className="absolute bottom-1 left-1 h-6 w-6 border border-line bg-white p-0.5">
                          <DesignRender design={t.design} />
                        </span>
                      </li>
                    );
                  })}
                </ul>

                {o.note && (
                  <p className="mt-4 flex items-start gap-2 text-[13px] text-muted">
                    <svg
                      viewBox="0 0 24 24"
                      className="mt-0.5 h-4 w-4 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      aria-hidden
                    >
                      <path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6-10-6-10-6Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    {o.note}
                  </p>
                )}

                <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-line pt-5">
                  {o.status === "In printing" && (
                    <Link
                      href={`/order/${o.id}`}
                      className="flex h-10 items-center border border-ink px-5 text-[13px] transition-colors hover:bg-ink hover:text-white"
                    >
                      Track order
                    </Link>
                  )}
                  {o.status === "Delivered" && (
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] text-muted">Rate</span>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => {
                            setRating((prev) => ({ ...prev, [o.id]: n }));
                            setNote(`Thanks — you rated #${o.id} ${n} out of 5.`);
                          }}
                          aria-label={`Rate order ${o.id} ${n} out of 5`}
                          className={
                            "text-[16px] leading-none " +
                            ((rating[o.id] ?? 0) >= n ? "text-[#5f7f06]" : "text-muted/50")
                          }
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  )}
                  {o.status !== "Cancelled" && (
                    <button
                      type="button"
                      onClick={() => invoice(o)}
                      className="flex h-10 items-center border border-ink px-5 text-[13px] transition-colors hover:bg-ink hover:text-white"
                    >
                      Download invoice
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => reorder(o)}
                    className="flex h-10 items-center border border-ink px-5 text-[13px] transition-colors hover:bg-ink hover:text-white"
                  >
                    Reorder
                  </button>
                  {o.status === "Delivered" && (
                    <Link
                      href="/account/support"
                      className="text-[13px] underline underline-offset-4"
                    >
                      Return or exchange
                    </Link>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
