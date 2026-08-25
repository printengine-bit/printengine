import { Suspense } from "react";
import type { Metadata } from "next";
import StorefrontShell from "@/components/layout/StorefrontShell";
import SearchResults from "@/components/search/SearchResults";

export const metadata: Metadata = {
  title: "Search",
  description: "Search printengine products, categories and guides.",
};

export default function Page() {
  return (
    <StorefrontShell>
        <Suspense
          fallback={
            <div className="container-pe py-10">
              <div className="h-64 animate-pulse border border-line bg-alt" aria-hidden />
            </div>
          }
        >
          <SearchResults />
        </Suspense>
    </StorefrontShell>
  );
}
