"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import ProductCard from "@/components/ui/ProductCard";
import { Search } from "@/components/ui/icons";
import { categories, type Product } from "@/lib/catalog";
import { guides } from "@/lib/content";

function score(haystack: string, q: string) {
  const h = haystack.toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .reduce((s, t) => s + (h.includes(t) ? 1 : 0), 0);
}

export default function SearchResults({ products }: { products: Product[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const q = (params.get("q") ?? "").trim();
  const [term, setTerm] = useState(q);

  const matchedProducts = q
    ? products
        .map((p) => ({
          p,
          s: score(`${p.name} ${p.subtitle} ${p.category} ${p.fit} ${p.colours.join(" ")}`, q),
        }))
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s)
        .map((x) => x.p)
    : [];

  const matchedCategories = q
    ? categories.filter((c) => score(`${c.name} ${c.subtitle}`, q) > 0)
    : [];

  const matchedGuides = q
    ? guides.filter((g) => score(`${g.title} ${g.intro}`, q) > 0)
    : [];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = term.trim();
    router.push(next ? `/search?q=${encodeURIComponent(next)}` : "/search");
  };

  const total = matchedProducts.length + matchedCategories.length + matchedGuides.length;

  return (
    <div className="container-pe py-8 lg:py-10">
      <h1 className="text-h1m lg:text-h1">Search</h1>

      <form onSubmit={submit} className="mt-6 flex max-w-xl">
        <label htmlFor="pe-search" className="sr-only">
          Search products and guides
        </label>
        <div className="flex h-12 min-w-0 flex-1 items-center gap-2 border border-line bg-white px-3">
          <Search className="h-4 w-4 shrink-0 text-muted" />
          <input
            id="pe-search"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search hoodies, jerseys, aprons…"
            className="min-w-0 flex-1 text-[15px] focus:outline-none"
          />
        </div>
        <button type="submit" className="h-12 shrink-0 bg-ink px-6 text-btn text-white">
          Search
        </button>
      </form>

      {!q ? (
        <div className="mt-10">
          <p className="text-[15px] text-muted">Popular searches</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {["hoodie", "jersey", "apron", "oversized", "polo", "embroidery"].map((s) => (
              <li key={s}>
                <Link
                  href={`/search?q=${s}`}
                  className="block border border-line px-4 py-2 text-[13px] transition-colors hover:border-ink"
                >
                  {s}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : total === 0 ? (
        <div className="mt-10 border border-line px-6 py-16 text-center">
          <p className="text-[16px]">Nothing matched “{q}”</p>
          <p className="mt-2 text-[14px] text-muted">
            Try a garment name, a colour, or a decoration method.
          </p>
          <Link
            href="/shop"
            className="mt-7 inline-flex h-12 items-center border border-ink px-7 text-btn transition-colors hover:bg-ink hover:text-white"
          >
            Browse all products
          </Link>
        </div>
      ) : (
        <>
          <p className="mt-6 text-[14px] text-muted" aria-live="polite">
            {total} {total === 1 ? "result" : "results"} for “{q}”
          </p>

          {matchedCategories.length > 0 && (
            <section className="mt-10">
              <h2 className="text-[16px] font-medium">Categories</h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {matchedCategories.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/shop/${c.slug}`}
                      className="block border border-line px-4 py-2 text-[13px] transition-colors hover:border-ink"
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {matchedProducts.length > 0 && (
            <section className="mt-10">
              <h2 className="text-[16px] font-medium">Products</h2>
              <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-6">
                {matchedProducts.map((p) => (
                  <li key={p.slug}>
                    <ProductCard product={p} showSwatches />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {matchedGuides.length > 0 && (
            <section className="mt-12">
              <h2 className="text-[16px] font-medium">Guides</h2>
              <ul className="mt-4 border-t border-line">
                {matchedGuides.map((g) => (
                  <li key={g.slug} className="border-b border-line">
                    <Link href={`/guides/${g.slug}`} className="block py-4">
                      <span className="text-[15px]">{g.title}</span>
                      <span className="mt-1 block text-[13px] text-muted">{g.intro}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
