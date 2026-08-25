"use client";

import { useState } from "react";
import ProductCard from "@/components/ui/ProductCard";
import type { Audience, Product } from "@/lib/catalog";

const FILTERS: (Audience | "All")[] = ["All", "Men", "Women", "Kids"];
const PAGE = 8;

export default function AllProducts({ products }: { products: Product[] }) {
  const [filter, setFilter] = useState<Audience | "All">("All");
  const [shown, setShown] = useState(PAGE);

  const list = products.filter(
    (p) => filter === "All" || p.audience.includes(filter)
  );
  const visible = list.slice(0, shown);

  return (
    <section className="section-pe bg-alt" aria-labelledby="all-heading">
      <div className="container-pe">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="all-heading" className="text-h2">
              All products
            </h2>
            <p className="mt-2 text-[15px] text-muted">
              Every blank we print on, ready to customise.
            </p>
          </div>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter products">
            {FILTERS.map((f) => {
              const active = filter === f;
              return (
                <button
                  key={f}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setFilter(f);
                    setShown(PAGE);
                  }}
                  className={
                    "border px-4 py-2 text-[13px] transition-colors " +
                    (active
                      ? "border-lime bg-lime text-ink"
                      : "border-line bg-white text-ink hover:border-ink")
                  }
                >
                  {f}
                </button>
              );
            })}
          </div>
        </div>

        <p className="sr-only" aria-live="polite">
          Showing {visible.length} of {list.length} products
        </p>

        <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-6">
          {visible.map((p) => (
            <li key={p.slug}>
              <ProductCard product={p} eagerImage kidsCover={filter === "Kids"} />
            </li>
          ))}
        </ul>

        {shown < list.length && (
          <div className="mt-12 flex justify-center">
            <button
              type="button"
              onClick={() => setShown((s) => s + PAGE)}
              className="h-12 border border-ink bg-transparent px-8 text-btn text-ink transition-colors hover:bg-ink hover:text-white"
            >
              Load more
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
