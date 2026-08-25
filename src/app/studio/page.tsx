import { Suspense } from "react";
import type { Metadata } from "next";
import StorefrontShell from "@/components/layout/StorefrontShell";
import StudioPicker from "@/components/studio/StudioPicker";
import { commerceProducts } from "@/lib/commerce-catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AI design studio",
  description:
    "Generate a print with AI, upload your own artwork, or add text. Place it on the front, back or either sleeve of any garment.",
};

export default async function Page() {
  const products = await commerceProducts();
  return (
    <StorefrontShell>
        <div className="container-pe pt-8">
          <h1 className="text-h1m lg:text-h1">Design studio</h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted">
            Pick a garment, choose a print area, then generate a design, upload your artwork or add
            text. Everything you make is saved to your account.
          </p>
        </div>
        <Suspense
          fallback={
            <div className="container-pe py-10">
              <div className="h-96 animate-pulse border border-line bg-alt" aria-hidden />
            </div>
          }
        >
          <StudioPicker catalog={products} />
        </Suspense>
    </StorefrontShell>
  );
}
