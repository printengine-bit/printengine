import { products, type Method } from "@/lib/catalog";
import type { AreaId, Design } from "@/lib/design";
import { automaticPromotions, type PromotionAdjustment } from "@/lib/promotions";

/**
 * Single source of truth for what things cost.
 * Imported by both the client cart store and server-rendered order data,
 * so the two can never disagree.
 */

export type CartLine = {
  id: string;
  slug: string;
  colour: string;
  size: string;
  method: Method;
  designs: { area: AreaId; label: string; design: Design }[];
  qty: number;
  stockLeft?: number;
};

export const METHOD_PRICE: Record<Method, number> = {
  "Custom print": 149,
  Embroidery: 249,
};

export const FREE_SHIPPING_THRESHOLD = 999;
export const SHIPPING_FEE = 79;
export const EXPRESS_FEE = 149;

export const COUPONS: Record<string, { off: number; label: string; minimum?: number }> = {
  FIRST150: { off: 150, label: "₹150 off your first order" },
  PRINT250: { off: 250, label: "₹250 off orders above ₹2,000", minimum: 2000 },
};

export const productFor = (slug: string) => products.find((p) => p.slug === slug);

export const lineDecoration = (l: CartLine) => l.designs.length * METHOD_PRICE[l.method];

export const lineTotal = (l: CartLine) => {
  const p = productFor(l.slug);
  if (!p) return 0;
  return (p.price + lineDecoration(l)) * l.qty;
};

export function cartTotals(
  lines: CartLine[],
  opts: { coupon?: string | null; express?: boolean } = {}
) {
  const subtotal = lines.reduce((s, l) => {
    const p = productFor(l.slug);
    return s + (p ? p.price * l.qty : 0);
  }, 0);
  const decoration = lines.reduce((s, l) => s + lineDecoration(l) * l.qty, 0);

  const automatic = automaticPromotions(lines, subtotal);
  const c = opts.coupon ? COUPONS[opts.coupon] : null;
  const eligible = c && (!c.minimum || subtotal + decoration >= c.minimum);
  const codeAdjustment: PromotionAdjustment | null = eligible
    ? {
        id: opts.coupon!,
        label: c.label,
        amount: c.off,
        kind: "code",
      }
    : null;

  // Keep pricing predictable: use the best available offer instead of silently
  // stacking discounts. The database checkout engine applies the authoritative rule.
  const adjustments = [...automatic, ...(codeAdjustment ? [codeAdjustment] : [])]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 1);
  const discount = adjustments.reduce((sum, adjustment) => sum + adjustment.amount, 0);

  const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const base = freeShipping ? 0 : lines.length > 0 ? SHIPPING_FEE : 0;
  const shipping = base + (opts.express && lines.length > 0 ? EXPRESS_FEE : 0);

  return {
    subtotal,
    decoration,
    discount,
    adjustments,
    shipping,
    total: Math.max(0, subtotal + decoration - discount + shipping),
    freeShipping,
    remainingForFree: Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal),
  };
}
