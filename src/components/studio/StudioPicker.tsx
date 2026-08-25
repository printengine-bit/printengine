"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import DesignRender from "@/components/product/DesignRender";
import DesignStudio, { type Tab } from "@/components/product/DesignStudio";
import { GarmentPhoto, ProductCover } from "@/components/ui/ProductMedia";
import { AREAS, VIEWBOX, type AreaId, type Design } from "@/lib/design";
import { hexFor, inr, type Product } from "@/lib/catalog";
import { writePending } from "@/lib/designs-store";
import { useRouter } from "next/navigation";

const pct = (v: number, total: number) => (v / total) * 100 + "%";

export default function StudioPicker({catalog}:{catalog:Product[]}) {
  const PICKS = catalog.map((product) => product.slug);
  const params = useSearchParams();
  const initialSlug = params.get("product");
  const initialChoice = PICKS.includes(initialSlug ?? "")
    ? (initialSlug as string)
    : PICKS.includes("fleece-hoodie")
      ? "fleece-hoodie"
      : PICKS[0];
  const [slug, setSlug] = useState(initialChoice);
  const [colour, setColour] = useState(
    () => catalog.find((product) => product.slug === initialChoice)?.colours[0] ?? "Black"
  );
  const [area, setArea] = useState<AreaId>("front");
  const [designs, setDesigns] = useState<Partial<Record<AreaId, Design>>>({});
  const [saved, setSaved] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false);
  const router = useRouter();

  const tabParam = params.get("tab");
  const initialTab: Tab =
    tabParam === "upload" ? "Upload artwork" : tabParam === "text" ? "Add text" : "Generate with AI";

  const product = catalog.find((p) => p.slug === slug)!;
  const current = AREAS.find((a) => a.id === area)!;
  const decorated = AREAS.filter((a) => designs[a.id]);
  const visiblePicks = showAll
    ? PICKS
    : Array.from(new Set([slug, ...PICKS])).slice(0, 6);

  return (
    <div className="container-pe py-8 lg:py-10">
      <section aria-labelledby="studio-garment-heading">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-lime">Step 1</p>
            <h2 id="studio-garment-heading" className="mt-1 text-[20px] font-medium">
              Choose a garment
            </h2>
          </div>
            <p className="text-[12px] text-muted">{catalog.length} products</p>
        </div>

        <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
          {visiblePicks.map((s) => {
            const p = catalog.find((x) => x.slug === s)!;
            const on = s === slug;
            return (
              <li key={s}>
                <button
                  type="button"
                  onClick={() => {
                    setSlug(s);
                    setColour(p.colours[0]);
                    setArea("front");
                  }}
                  aria-pressed={on}
                  className={
                    "group block w-full border-2 bg-white text-left transition-colors " +
                    (on ? "border-lime" : "border-transparent hover:border-line")
                  }
                >
                  <span className="relative block aspect-[4/3] overflow-hidden bg-alt">
                    <ProductCover
                      slug={p.slug}
                      name={p.name}
                      sizes="(max-width: 640px) 50vw, (max-width: 1280px) 25vw, 16vw"
                      className="transition-transform duration-300 group-hover:scale-[1.02]"
                      eager={!showAll}
                    />
                  </span>
                  <span className="block px-3 py-2.5">
                    <span className="block min-h-8 text-[12px] font-medium leading-tight text-ink">{p.name}</span>
                    <span className="mt-0.5 block text-[11px] text-muted">{inr(p.price)}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <button
          type="button"
          onClick={() => setShowAll((currentValue) => !currentValue)}
          className="mt-4 border border-line bg-white px-4 py-2 text-[13px] hover:border-ink"
        >
          {showAll ? "Show fewer garments" : `Show all ${catalog.length} garments`}
        </button>
      </section>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(380px,0.92fr)] lg:items-start lg:gap-12">
        <section className="min-w-0" aria-labelledby="studio-preview-heading">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-lime">Step 2</p>
              <h2 id="studio-preview-heading" className="mt-1 text-[20px] font-medium">
                Choose colour and placement
              </h2>
            </div>
            <p className="text-[13px] text-muted">
              {product.name} · <span className="text-ink">{colour}</span>
            </p>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2" aria-label="Garment colour">
            {product.colours.map((name) => (
              <button
                key={name}
                type="button"
                aria-label={`Colour ${name}`}
                aria-pressed={colour === name}
                title={name}
                onClick={() => setColour(name)}
                className={
                  "h-9 w-9 border-2 p-0.5 transition-colors " +
                  (colour === name ? "border-lime" : "border-line hover:border-muted")
                }
              >
                <span className="block h-full w-full border border-black/10" style={{ backgroundColor: hexFor(name) }} />
              </button>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-4 gap-1.5 sm:flex sm:flex-wrap sm:gap-2" role="tablist" aria-label="Print placement">
            {AREAS.map((a) => (
              <button
                key={a.id}
                type="button"
                role="tab"
                aria-selected={area === a.id}
                onClick={() => setArea(a.id)}
                className={
                  "min-w-0 border px-1.5 py-2 text-[11px] transition-colors sm:px-4 sm:text-[13px] " +
                  (area === a.id ? "border-lime bg-lime text-ink" : "border-line bg-white hover:border-ink")
                }
              >
                {a.label}
                {designs[a.id] && (
                  <span
                    className={"ml-2 inline-block h-1.5 w-1.5 " + (area === a.id ? "bg-ink" : "bg-lime")}
                    aria-label="has a design"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="relative mt-4 aspect-[4/5] bg-alt">
            <GarmentPhoto
              kind={product.kind}
              area={area}
              colour={hexFor(colour)}
              name={product.name}
              className="absolute inset-0 h-full w-full"
              priority
            />
            <div
              className="absolute border border-dashed border-muted/60"
              style={{
                left: pct(current.x, VIEWBOX.w),
                top: pct(current.y, VIEWBOX.h),
                width: pct(current.w, VIEWBOX.w),
                height: pct(current.h, VIEWBOX.h),
              }}
            >
              {designs[area] && (
                <div className="absolute inset-0 p-0.5">
                  <DesignRender design={designs[area]!} />
                </div>
              )}
            </div>
            <p className="absolute bottom-3 left-3 bg-white/90 px-2 py-1 text-[11px] text-muted">
              Printable area {current.size}
            </p>

            {designs[area] && (
              <button
                type="button"
                onClick={() =>
                  setDesigns((previous) => {
                    const next = { ...previous };
                    delete next[area];
                    return next;
                  })
                }
                className="absolute right-3 top-3 border border-line bg-white px-3 py-1.5 text-[12px] hover:border-ink"
              >
                Remove design
              </button>
            )}
          </div>
        </section>

        <aside className="min-w-0 lg:h-full lg:self-stretch">
          <div className="lg:sticky lg:top-[108px]">
            <div className="mb-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-lime">Step 3</p>
              <h2 className="mt-1 text-[20px] font-medium">Add your artwork</h2>
            </div>
            <DesignStudio
              areaLabel={current.label}
              onApply={(d) => setDesigns((prev) => ({ ...prev, [area]: d }))}
              saved={saved}
              onToggleSave={(k) =>
                setSaved((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]))
              }
              initialTab={initialTab}
            />

            <div className="mt-5 border border-line bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[15px] font-medium">{product.name}</p>
                  <p className="mt-1 text-[13px] text-muted">{colour}</p>
                </div>
                <p className="text-[15px]">{inr(product.price)}</p>
              </div>
              <p className="mt-3 text-[13px] text-muted">
                {decorated.length} {decorated.length === 1 ? "area designed" : "areas designed"}
              </p>
              <button
                type="button"
                onClick={() => {
                  writePending({ slug: product.slug, designs, colour });
                  router.push(`/product/${product.slug}?design=studio`);
                }}
                className="mt-5 flex h-12 w-full items-center justify-center bg-lime text-btn text-ink transition-opacity hover:opacity-90"
              >
                Continue to size and checkout
              </button>
              <p className="mt-3 text-[12px] leading-relaxed text-muted">
                Your garment, colour and artwork will carry across to the product page.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
