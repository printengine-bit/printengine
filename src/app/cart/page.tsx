import type { Metadata } from "next";
import Link from "next/link";
import StorefrontShell from "@/components/layout/StorefrontShell";
import CartView from "@/components/cart/CartView";
import { commerceProducts } from "@/lib/commerce-catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your cart",
  description: "Review your custom printed and embroidered items before checkout.",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const products = await commerceProducts();
  return (
    <StorefrontShell>
        <div className="container-pe pb-8 pt-6">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-[13px] text-muted">
              <li className="flex items-center gap-2">
                <Link href="/" className="underline-offset-4 hover:text-ink hover:underline">
                  Home
                </Link>
                <span aria-hidden>/</span>
              </li>
              <li className="text-ink">Your cart</li>
            </ol>
          </nav>
          <h1 className="mt-6 text-h1m lg:text-h1">Your cart</h1>
        </div>
        <CartView products={products} />
    </StorefrontShell>
  );
}
