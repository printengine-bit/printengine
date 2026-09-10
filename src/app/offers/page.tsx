import type { Metadata } from "next";
import LandingShell from "@/components/layout/LandingShell";
import { commerceProducts } from "@/lib/commerce-catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Offers",
  description: "Current discounts, coupon codes and combo pricing on custom printed clothing.",
};

export default async function Page() {
  const products = await commerceProducts();
  const discounted = [...products]
    .sort((a, b) => (b.mrp - b.price) / b.mrp - (a.mrp - a.price) / a.mrp)
    .slice(0, 4);
  return (
    <LandingShell
      eyebrow="Live offers"
      title="Deals on made-to-order clothing"
      intro="Automatic offers and coupon codes are compared for you, and the best eligible saving is applied."
      primary={{ label: "Shop the sale", href: "/shop?sale=1" }}
      secondary={{ label: "Start designing", href: "/studio" }}
      blocks={[
        { heading: "Buy 2, save 10%", body: "Add any two garments and the saving is applied automatically—no code needed." },
        { heading: "FIRST150", body: "₹150 off your first order, no minimum. Enter the code in your cart." },
        { heading: "Free shipping", body: "Free standard delivery on every order above ₹999, everywhere in India." },
        { heading: "Bulk pricing", body: "Ordering 10 or more? Slab pricing beats every coupon. Request a quote." },
      ]}
      products={discounted}
      productsHeading="Biggest discounts right now"
    />
  );
}
