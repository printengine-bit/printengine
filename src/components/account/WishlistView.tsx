"use client";

import { useState } from "react";
import Link from "next/link";
import Garment from "@/components/ui/Garment";
import { Heart } from "@/components/ui/icons";
import { hexFor, inr, products } from "@/lib/catalog";
import { useCart } from "@/lib/cart-store";

const OUT_OF_STOCK: Record<string, string> = { "dry-fit-jersey": "M" };

export default function WishlistView() {
  const { hydrated, wishlist, toggleWishlist, addLine } = useCart();
  const [moved, setMoved] = useState<string[]>([]);
  const [notified, setNotified] = useState<string[]>([]);

  const items = wishlist
    .map((slug) => ({ slug, outOfStockSize: OUT_OF_STOCK[slug] ?? null }))
    .filter((w) => products.some((p) => p.slug === w.slug));

  if (!hydrated) {
    return (
      <div className="h-64 animate-pulse border border-line bg-alt" aria-hidden>
        <span className="sr-only">Loading your wishlist</span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="border border-line px-6 py-20 text-center">
        <Heart className="mx-auto h-10 w-10 text-ink" />
        <h2 className="mt-6 text-[20px] font-medium tracking-[-0.02em]">Nothing saved yet</h2>
        <p className="mt-2 text-[14px] text-muted">
          Tap the heart on any product to keep it here.
        </p>
        <Link
          href="/shop"
          className="mt-7 inline-flex h-12 items-center bg-lime px-8 text-btn text-ink transition-opacity hover:opacity-90"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <>
      <p className="sr-only" aria-live="polite">
        {items.length} items in your wishlist
      </p>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-6">
        {items.map((w) => {
          const p = products.find((x) => x.slug === w.slug)!;
          const off = Math.round(((p.mrp - p.price) / p.mrp) * 100);
          const isMoved = moved.includes(w.slug);
          return (
            <li key={w.slug}>
              <div className="relative aspect-[4/5] bg-alt">
                <span className="absolute left-0 top-0 z-10 bg-lime px-2.5 py-1 text-[11px] font-medium text-ink">
                  Customisable
                </span>
                <button
                  type="button"
                  onClick={() => toggleWishlist(w.slug)}
                  aria-label={`Remove ${p.name} from wishlist`}
                  className="absolute right-3 top-3 z-10 p-1 text-[#5f7f06] hover:text-ink"
                >
                  <Heart className="h-5 w-5" />
                </button>
                <Garment kind={p.kind} className="h-full w-full p-6" />
              </div>

              <h3 className="mt-4 text-[15px] leading-snug">
                <Link href={`/product/${p.slug}`} className="underline-offset-4 hover:underline">
                  {p.name}
                </Link>
              </h3>
              <p className="mt-1 text-[13px] text-muted">{p.subtitle}</p>
              <p className="mt-2 flex flex-wrap items-baseline gap-x-2">
                <span className="text-[15px] font-medium">{inr(p.price)}</span>
                <span className="text-[13px] text-muted line-through">{inr(p.mrp)}</span>
                <span className="text-[13px] text-[#5f7f06]">{off}% off</span>
              </p>
              <ul className="mt-3 flex items-center gap-1.5" aria-label="Available colours">
                {p.colours.slice(0, 5).map((c) => (
                  <li
                    key={c}
                    title={c}
                    className="relative h-3.5 w-3.5 border border-line"
                    style={{ backgroundColor: hexFor(c) }}
                  >
                    <span className="sr-only">{c}</span>
                  </li>
                ))}
              </ul>

              {w.outOfStockSize ? (
                <div className="mt-4">
                  <p className="text-[13px] text-muted">
                    Out of stock in size {w.outOfStockSize}
                  </p>
                  <button
                    type="button"
                    onClick={() => setNotified((prev) => [...prev, w.slug])}
                    disabled={notified.includes(w.slug)}
                    className="mt-1 text-[13px] underline underline-offset-4 disabled:no-underline disabled:opacity-60"
                  >
                    {notified.includes(w.slug) ? "We will tell you when it is back" : "Notify me"}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    addLine({
                      slug: p.slug,
                      colour: p.colours[0],
                      size: p.sizes.includes("M") ? "M" : p.sizes[0],
                      method: p.methods[0],
                      designs: [],
                      qty: 1,
                    });
                    setMoved((prev) => [...prev, w.slug]);
                  }}
                  disabled={isMoved}
                  className={
                    "mt-4 h-11 w-full border text-btn transition-colors " +
                    (isMoved
                      ? "border-line bg-alt text-muted"
                      : "border-ink hover:bg-ink hover:text-white")
                  }
                >
                  {isMoved ? "Added to cart" : "Move to cart"}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}
