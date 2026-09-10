"use client";

import { useState } from "react";
import Link from "next/link";
import Garment from "@/components/ui/Garment";
import ProductCard from "@/components/ui/ProductCard";
import DesignRender from "@/components/product/DesignRender";
import { ArrowRight, Bag, Close, Lock, Repeat, Truck } from "@/components/ui/icons";
import { hexFor, inr, type Product } from "@/lib/catalog";
import { lineTotal, productFor, useCart } from "@/lib/cart-store";
import { cartTotals } from "@/lib/pricing";

export default function CartView({ products }: { products: Product[] }) {
  const {
    hydrated,
    lines,
    setQty,
    removeLine,
    toggleWishlist,
    wishlist,
    coupon: applied,
    applyCoupon: applyCode,
    clearCoupon,
    express,
    itemCount,
  } = useCart();

  const [coupon, setCoupon] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);

  const totals = cartTotals(lines, { coupon: applied, express }, products);
  const garmentSubtotal = totals.subtotal;
  const decorationTotal = totals.decoration;
  const total = totals.total;
  const remainingForFree = totals.remainingForFree;
  const freeShipping = totals.freeShipping;
  const progress = Math.min(100, (garmentSubtotal / 999) * 100);

  const remove = removeLine;

  const saveForLater = (id: string) => {
    const line = lines.find((l) => l.id === id);
    if (!line) return;
    if (!wishlist.includes(line.slug)) toggleWishlist(line.slug);
    removeLine(id);
  };

  const applyCoupon = () => {
    const res = applyCode(coupon);
    if (!res.ok) {
      setCouponError(res.message ?? "That code is not valid.");
      return;
    }
    setCoupon("");
    setCouponError(null);
  };

  const savedProducts = wishlist
    .map((s) => products.find((p) => p.slug === s))
    .filter(Boolean)
    .slice(0, 3);

  const recommended = products
    .filter((p) => !lines.some((l) => l.slug === p.slug) && !wishlist.includes(p.slug))
    .slice(0, 4);

  if (!hydrated) {
    return (
      <div className="container-pe pb-16">
        <div className="h-64 animate-pulse border border-line bg-alt" aria-hidden />
        <p className="sr-only">Loading your cart</p>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="container-pe">
        <div className="flex flex-col items-center justify-center border-y border-line py-28 text-center">
          <Bag className="h-12 w-12 text-ink" />
          <h2 className="mt-8 text-h1m lg:text-[40px]">Your cart is empty</h2>
          <p className="mt-3 text-[15px] text-muted">
            Nothing here yet — start with a blank and make it yours.
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-flex h-12 items-center bg-lime px-8 text-btn text-ink transition-opacity hover:opacity-90"
          >
            Start designing
          </Link>
          <Link href="/shop" className="mt-5 text-[14px] underline underline-offset-4">
            Browse all products
          </Link>
        </div>

        {savedProducts.length > 0 && (
          <section className="section-pe" aria-labelledby="saved-empty">
            <h2 id="saved-empty" className="text-h2">
              Saved for later
            </h2>
            <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-6">
              {savedProducts.map((p) => (
                <li key={p!.slug}>
                  <ProductCard product={p!} showSwatches />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="container-pe grid gap-10 pb-16 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-12">
        <div>
          <div className="border border-line p-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-[13px]">
                {freeShipping ? (
                  <span className="text-[#5f7f06]">Free shipping unlocked</span>
                ) : (
                  <>
                    Add{" "}
                    <span className="font-medium">{inr(remainingForFree)}</span> more for free
                    shipping
                  </>
                )}
              </p>
              <Truck className="h-5 w-5 shrink-0 text-muted" />
            </div>
            <div className="mt-3 h-1 w-full bg-alt">
              <div className="h-full bg-lime" style={{ width: progress + "%" }} />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-4 bg-lime/20 px-4 py-3 text-[13px]">
            <span>Buy any 2 garments and save 10% automatically.</span>
            <span className="shrink-0 font-medium">No code needed</span>
          </div>

          <ul>
            {lines.map((l) => {
              const p = productFor(l.slug, products);
              if (!p) return null;
              return (
                <li key={l.id} className="border-b border-line py-6">
                  <div className="flex gap-4 lg:gap-6">
                    <Link
                      href={`/product/${p.slug}`}
                      className="h-28 w-24 shrink-0 bg-alt lg:h-32 lg:w-28"
                    >
                      <Garment kind={p.kind} className="h-full w-full p-3" />
                    </Link>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                        <h3 className="text-[16px]">
                          <Link href={`/product/${p.slug}`} className="hover:underline">
                            {p.name}
                          </Link>
                        </h3>
                        <p className="text-[15px] font-medium">{inr(lineTotal(l, products))}</p>
                      </div>

                      <p className="mt-1 flex flex-wrap items-center gap-2 text-[13px] text-muted">
                        <span
                          className="inline-block h-3 w-3 border border-line"
                          style={{ backgroundColor: hexFor(l.colour) }}
                          aria-hidden
                        />
                        Colour: {l.colour} · Size: {l.size}
                      </p>
                      <p className="text-[13px] text-muted">
                        {l.method} · {l.designs.length}{" "}
                        {l.designs.length === 1 ? "area" : "areas"}
                      </p>

                      {l.stockLeft !== undefined && (
                        <p className="mt-2 text-[12px] text-[#8a2b2b]">
                          Only {l.stockLeft} left in this size
                        </p>
                      )}

                      <div className="mt-3 border border-line bg-alt p-3">
                        <div className="flex items-start justify-between gap-4">
                          <ul className="flex flex-wrap gap-3">
                            {l.designs.map((d) => (
                              <li key={d.area}>
                                <div className="h-12 w-12 border border-line bg-white p-1">
                                  <DesignRender design={d.design} />
                                </div>
                                <p className="mt-1 text-[10px] text-muted">{d.label}</p>
                              </li>
                            ))}
                          </ul>
                          <Link
                            href={`/product/${p.slug}?line=${l.id}`}
                            className="shrink-0 text-[13px] underline underline-offset-4"
                          >
                            Edit design
                          </Link>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center border border-line">
                          <button
                            type="button"
                            onClick={() => setQty(l.id, -1)}
                            disabled={l.qty <= 1}
                            aria-label={`Decrease quantity of ${p.name}`}
                            className="h-9 w-9 text-[16px] disabled:text-muted/40"
                          >
                            −
                          </button>
                          <span
                            className="w-10 text-center text-[14px]"
                            aria-live="polite"
                            aria-label={`Quantity ${l.qty}`}
                          >
                            {l.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQty(l.id, 1)}
                            disabled={l.qty >= 10}
                            aria-label={`Increase quantity of ${p.name}`}
                            className="h-9 w-9 text-[16px] disabled:text-muted/40"
                          >
                            +
                          </button>
                        </div>

                        <div className="flex items-center gap-4 text-[13px] text-muted">
                          <button
                            type="button"
                            onClick={() => saveForLater(l.id)}
                            className="underline-offset-4 hover:text-ink hover:underline"
                          >
                            Save for later
                          </button>
                          <button
                            type="button"
                            onClick={() => remove(l.id)}
                            className="underline-offset-4 hover:text-ink hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <aside>
          <div className="border border-line p-6 lg:sticky lg:top-28">
            <h2 className="text-[18px] font-medium">Order summary</h2>

            <div className="mt-5">
              <label htmlFor="pe-coupon" className="mb-2 block text-[13px] text-muted">
                Coupon code
              </label>
              <div className="flex">
                <input
                  id="pe-coupon"
                  value={coupon}
                  onChange={(e) => {
                    setCoupon(e.target.value);
                    if (couponError) setCouponError(null);
                  }}
                  placeholder="Enter code"
                  className="h-11 min-w-0 flex-1 border border-line px-3 text-[14px] focus:border-ink focus:outline-none"
                />
                <button
                  type="button"
                  onClick={applyCoupon}
                  className="h-11 shrink-0 border border-ink px-5 text-btn transition-colors hover:bg-ink hover:text-white"
                >
                  Apply
                </button>
              </div>
              {couponError && <p className="mt-2 text-[13px] text-[#a32d2d]">{couponError}</p>}

              {applied && (
                <div className="mt-3 flex items-center gap-2 bg-lime px-3 py-1.5 text-[12px] font-medium text-ink">
                  {applied} applied
                  <button
                    type="button"
                    onClick={clearCoupon}
                    aria-label={`Remove coupon ${applied}`}
                    className="ml-auto"
                  >
                    <Close className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            <dl className="mt-6 space-y-2.5 border-t border-line pt-5 text-[14px]">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal ({itemCount} items)</dt>
                <dd>{inr(garmentSubtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Decoration charges</dt>
                <dd>{inr(decorationTotal)}</dd>
              </div>
              {totals.adjustments.map((adjustment) => (
                <div key={adjustment.id} className="flex justify-between gap-4 text-[#5f7f06]">
                  <dt>{adjustment.label}</dt>
                  <dd className="shrink-0">−{inr(adjustment.amount)}</dd>
                </div>
              ))}
              <div className="flex justify-between">
                <dt className="text-muted">Shipping</dt>
                <dd className={freeShipping ? "text-[#5f7f06]" : ""}>
                  {freeShipping ? "Free" : inr(79)}
                </dd>
              </div>
            </dl>

            <div className="mt-5 flex items-baseline justify-between border-t border-line pt-5">
              <span className="text-[15px]">Total</span>
              <span className="text-[20px] font-medium">
                {inr(total)}
              </span>
            </div>
            <p className="mt-1 text-right text-[12px] text-muted">Inclusive of all taxes</p>

            <Link
              href="/checkout"
              className="mt-5 flex h-12 w-full items-center justify-center gap-2 bg-lime text-btn text-ink transition-opacity hover:opacity-90"
            >
              Proceed to checkout <ArrowRight className="h-4 w-4" />
            </Link>

            <ul className="mt-6 grid grid-cols-3 gap-3 border-t border-line pt-5 text-center">
              {[
                { Icon: Lock, label: "Secure payments" },
                { Icon: Truck, label: "48-hour dispatch" },
                { Icon: Repeat, label: "Free reprint" },
              ].map(({ Icon, label }) => (
                <li key={label} className="flex flex-col items-center gap-2">
                  <Icon className="h-5 w-5 text-muted" />
                  <span className="text-[11px] leading-tight text-muted">{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {savedProducts.length > 0 && (
        <section className="border-t border-line" aria-labelledby="saved-heading">
          <div className="container-pe section-pe">
            <h2 id="saved-heading" className="text-h2">
              Saved for later
            </h2>
            <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-6">
              {savedProducts.map((p) => (
                <li key={p!.slug}>
                  <ProductCard product={p!} showSwatches />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {recommended.length > 0 && (
        <section className="border-t border-line bg-alt" aria-labelledby="rec-heading">
          <div className="container-pe section-pe">
            <h2 id="rec-heading" className="text-h2">
              You may also like
            </h2>
            <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-6">
              {recommended.map((p) => (
                <li key={p.slug}>
                  <ProductCard product={p} showSwatches />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <div className="sticky bottom-0 z-40 border-t border-line bg-white p-4 lg:hidden">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-[12px] text-muted">Total</p>
            <p className="text-[18px] font-medium">
              {inr(total)}
            </p>
          </div>
          <Link
            href="/checkout"
            className="flex h-12 flex-1 items-center justify-center bg-lime text-btn text-ink"
          >
            Checkout
          </Link>
        </div>
      </div>
    </>
  );
}
