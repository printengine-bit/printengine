"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/ui/ProductCard";
import type { Product } from "@/lib/catalog";

const KEY = "printengine.recentlyViewed";
const MAX = 8;

export default function RecentlyViewed({ currentSlug, products }: { currentSlug: string; products: Product[] }) {
  const [seen, setSeen] = useState<Product[]>([]);

  // Browsing history lives in localStorage, readable only after mount.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    let history: string[] = [];
    try {
      history = JSON.parse(localStorage.getItem(KEY) || "[]") as string[];
    } catch {
      history = [];
    }

    setSeen(
      history
        .filter((s) => s !== currentSlug)
        .map((s) => products.find((p) => p.slug === s))
        .filter((p): p is Product => Boolean(p))
        .slice(0, 4)
    );

    const next = [currentSlug, ...history.filter((s) => s !== currentSlug)].slice(0, MAX);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // storage unavailable — history simply will not persist
    }
  }, [currentSlug, products]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (seen.length === 0) return null;

  return (
    <section className="border-t border-line" aria-labelledby="recent-heading">
      <div className="container-pe section-pe">
        <h2 id="recent-heading" className="text-h2">
          Recently viewed
        </h2>
        <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-6">
          {seen.map((p) => (
            <li key={p.slug}>
              <ProductCard product={p} showSwatches />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
