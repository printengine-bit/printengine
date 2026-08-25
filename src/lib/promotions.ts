import type { CartLine } from "@/lib/pricing";

export type PromotionAdjustment = {
  id: string;
  label: string;
  amount: number;
  kind: "automatic" | "code";
};

/**
 * Storefront preview rules. The custom database discount engine remains
 * authoritative during checkout.
 */
export const AUTOMATIC_PROMOTIONS = [
  {
    id: "buy-2-save-10",
    label: "Buy 2 or more — 10% off garments",
    minimumQuantity: 2,
    percentOff: 10,
  },
] as const;

export function automaticPromotions(lines: CartLine[], garmentSubtotal: number) {
  const quantity = lines.reduce((sum, line) => sum + line.qty, 0);
  const promotion = AUTOMATIC_PROMOTIONS.find((rule) => quantity >= rule.minimumQuantity);

  if (!promotion || garmentSubtotal <= 0) return [] satisfies PromotionAdjustment[];

  return [
    {
      id: promotion.id,
      label: promotion.label,
      amount: Math.round((garmentSubtotal * promotion.percentOff) / 100),
      kind: "automatic" as const,
    },
  ];
}
