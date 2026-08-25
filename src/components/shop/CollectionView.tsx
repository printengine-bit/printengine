"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ProductCard from "@/components/ui/ProductCard";
import FilterPanel, { EMPTY, type Filters } from "@/components/shop/FilterPanel";
import { Close } from "@/components/ui/icons";
import type { Product } from "@/lib/catalog";
import { useDialog } from "@/lib/use-dialog";

const SORTS = ["Popularity", "Price low to high", "Price high to low", "New arrivals"] as const;
type Sort = (typeof SORTS)[number];

const PAGE = 6;


function fromParams(sp: URLSearchParams): Filters {
  const list = (k: string) => (sp.get(k) ? sp.get(k)!.split(",").filter(Boolean) : []);
  const max = Number(sp.get("max"));
  return {
    fits: list("fit"),
    audiences: list("gender") as Filters["audiences"],
    sizes: list("size"),
    colours: list("colour"),
    methods: list("method") as Filters["methods"],
    maxPrice: max >= 400 && max <= EMPTY.maxPrice ? max : EMPTY.maxPrice,
    onSale: sp.get("sale") === "1",
  };
}

function toQuery(f: Filters, sort: Sort): string {
  const sp = new URLSearchParams();
  const put = (k: string, v: string[]) => {
    if (v.length) sp.set(k, v.join(","));
  };
  put("fit", f.fits);
  put("gender", f.audiences);
  put("size", f.sizes);
  put("colour", f.colours);
  put("method", f.methods);
  if (f.maxPrice < EMPTY.maxPrice) sp.set("max", String(f.maxPrice));
  if (f.onSale) sp.set("sale", "1");
  if (sort !== "Popularity") sp.set("sort", sort);
  return sp.toString();
}

export default function CollectionView({ pool }: { pool: Product[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [filters, setFilters] = useState<Filters>(() =>
    fromParams(new URLSearchParams(searchParams.toString()))
  );
  const [sort, setSort] = useState<Sort>(() => {
    const s = searchParams.get("sort");
    return (SORTS as readonly string[]).includes(s ?? "") ? (s as Sort) : "Popularity";
  });
  const [shown, setShown] = useState(PAGE);
  const [drawer, setDrawer] = useState(false);
  const drawerRef = useDialog<HTMLDivElement>(drawer, () => setDrawer(false));

  useEffect(() => {
    const q = toQuery(filters, sort);
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  }, [filters, sort, pathname, router]);

  const fitOptions = useMemo(
    () => Array.from(new Set(pool.map((p) => p.fit))).sort(),
    [pool]
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    const bump = (k: string) => (c[k] = (c[k] ?? 0) + 1);
    for (const p of pool) {
      bump(p.fit);
      p.audience.forEach(bump);
      p.methods.forEach(bump);
    }
    return c;
  }, [pool]);

  const filtered = useMemo(() => {
    const out = pool.filter((p) => {
      if (filters.fits.length && !filters.fits.includes(p.fit)) return false;
      if (filters.audiences.length && !filters.audiences.some((a) => p.audience.includes(a)))
        return false;
      if (filters.sizes.length && !filters.sizes.some((s) => p.sizes.includes(s as never)))
        return false;
      if (filters.colours.length && !filters.colours.some((c) => p.colours.includes(c)))
        return false;
      if (filters.methods.length && !filters.methods.some((m) => p.methods.includes(m)))
        return false;
      if (p.price > filters.maxPrice) return false;
      if (filters.onSale && p.price >= p.mrp) return false;
      return true;
    });

    switch (sort) {
      case "Price low to high":
        return [...out].sort((a, b) => a.price - b.price);
      case "Price high to low":
        return [...out].sort((a, b) => b.price - a.price);
      case "New arrivals":
        return [...out].sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew));
      default:
        return [...out].sort((a, b) => Number(!!b.bestseller) - Number(!!a.bestseller));
    }
  }, [pool, filters, sort]);

  const chips: { label: string; clear: () => void }[] = [];
  filters.fits.forEach((f) =>
    chips.push({
      label: `Fit: ${f}`,
      clear: () => setFilters({ ...filters, fits: filters.fits.filter((x) => x !== f) }),
    })
  );
  filters.audiences.forEach((a) =>
    chips.push({
      label: a,
      clear: () =>
        setFilters({ ...filters, audiences: filters.audiences.filter((x) => x !== a) }),
    })
  );
  filters.sizes.forEach((s) =>
    chips.push({
      label: `Size: ${s}`,
      clear: () => setFilters({ ...filters, sizes: filters.sizes.filter((x) => x !== s) }),
    })
  );
  filters.colours.forEach((c) =>
    chips.push({
      label: `Colour: ${c}`,
      clear: () => setFilters({ ...filters, colours: filters.colours.filter((x) => x !== c) }),
    })
  );
  filters.methods.forEach((m) =>
    chips.push({
      label: m,
      clear: () => setFilters({ ...filters, methods: filters.methods.filter((x) => x !== m) }),
    })
  );
  if (filters.onSale)
    chips.push({ label: "On sale", clear: () => setFilters({ ...filters, onSale: false }) });
  if (filters.maxPrice < EMPTY.maxPrice)
    chips.push({
      label: `Under ₹${filters.maxPrice.toLocaleString("en-IN")}`,
      clear: () => setFilters({ ...filters, maxPrice: EMPTY.maxPrice }),
    });

  const reset = () => {
    setFilters(EMPTY);
    setShown(PAGE);
  };

  const visible = filtered.slice(0, shown);
  const kidsOnly =
    filters.audiences.length === 1 && filters.audiences[0] === "Kids";

  return (
    <>
      <div className="sticky top-16 z-30 border-y border-line bg-white lg:top-[72px]">
        <div className="container-pe flex items-center gap-3 py-3">
          <button
            type="button"
            onClick={() => setDrawer(true)}
            className="flex h-10 items-center gap-2 border border-ink px-4 text-[13px] lg:hidden"
          >
            Filters
            {chips.length > 0 && (
              <span className="bg-lime px-1.5 text-[11px] font-medium text-ink">
                {chips.length}
              </span>
            )}
          </button>

          <ul className="no-scrollbar flex flex-1 items-center gap-2 overflow-x-auto">
            {chips.map((c) => (
              <li key={c.label}>
                <button
                  type="button"
                  onClick={() => {
                    c.clear();
                    setShown(PAGE);
                  }}
                  className="flex shrink-0 items-center gap-2 border border-line px-3 py-1.5 text-[13px] hover:border-ink"
                >
                  {c.label}
                  <Close className="h-3 w-3" />
                </button>
              </li>
            ))}
            {chips.length > 0 && (
              <li>
                <button
                  type="button"
                  onClick={reset}
                  className="shrink-0 text-[13px] underline underline-offset-4"
                >
                  Clear all
                </button>
              </li>
            )}
          </ul>

          <label className="flex shrink-0 items-center gap-2 text-[13px] text-muted">
            <span className="max-sm:sr-only">Sort by</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="h-10 border border-line bg-white px-3 text-[13px] text-ink focus:border-ink focus:outline-none"
            >
              {SORTS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="container-pe grid gap-10 py-10 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-12">
        <aside className="hidden lg:block">
          <FilterPanel
            filters={filters}
            setFilters={(f) => {
              setFilters(f);
              setShown(PAGE);
            }}
            fitOptions={fitOptions}
            counts={counts}
          />
        </aside>

        <div>
          <p className="sr-only" aria-live="polite">
            Showing {visible.length} of {filtered.length} products
          </p>

          {filtered.length === 0 ? (
            <div className="border border-line px-6 py-16 text-center">
              <p className="text-[16px]">No products match these filters</p>
              <p className="mt-2 text-[14px] text-muted">
                Try removing a filter or widening your price range.
              </p>
              <button
                type="button"
                onClick={reset}
                className="mt-6 h-11 border border-ink px-6 text-btn transition-colors hover:bg-ink hover:text-white"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-3 lg:gap-6">
                {visible.map((p) => (
                  <li key={p.slug}>
                    <ProductCard product={p} showSwatches kidsCover={kidsOnly} />
                  </li>
                ))}
              </ul>

              <div className="mt-14 flex flex-col items-center gap-4">
                <p className="text-[13px] text-muted">
                  Showing {visible.length} of {filtered.length} products
                </p>
                {shown < filtered.length && (
                  <button
                    type="button"
                    onClick={() => setShown((s) => s + PAGE)}
                    className="h-12 border border-ink px-8 text-btn transition-colors hover:bg-ink hover:text-white"
                  >
                    Load more
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {drawer && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-ink/50"
            onClick={() => setDrawer(false)}
            aria-hidden
          />
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
            tabIndex={-1}
            className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col bg-white"
          >
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-line px-6">
              <p className="text-[15px] font-medium">Filters</p>
              <button type="button" aria-label="Close filters" onClick={() => setDrawer(false)}>
                <Close className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6">
              <FilterPanel
                filters={filters}
                setFilters={(f) => {
                  setFilters(f);
                  setShown(PAGE);
                }}
                fitOptions={fitOptions}
                counts={counts}
              />
            </div>
            <div className="flex shrink-0 gap-3 border-t border-line px-6 py-4">
              <button
                type="button"
                onClick={reset}
                className="h-12 flex-1 border border-ink text-btn"
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={() => setDrawer(false)}
                className="h-12 flex-1 bg-lime text-btn text-ink"
              >
                Show {filtered.length} products
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
