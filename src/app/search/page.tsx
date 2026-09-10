import { Suspense } from "react";
import type { Metadata } from "next";
import StorefrontShell from "@/components/layout/StorefrontShell";
import SearchResults from "@/components/search/SearchResults";
import { commerceProducts } from "@/lib/commerce-catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search",
  description: "Search printengine products, categories and guides.",
};

export default async function Page() {
  const products = await commerceProducts();
  return (
    <StorefrontShell>
        <Suspense
          fallback={
            <div className="container-pe py-10">
              <div className="h-64 animate-pulse border border-line bg-alt" aria-hidden />
            </div>
          }
        >
          <SearchResults products={products} />
        </Suspense>
    </StorefrontShell>
  );
}
