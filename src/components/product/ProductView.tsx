"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GarmentPhoto } from "@/components/ui/ProductMedia";
import DesignRender from "@/components/product/DesignRender";
import DesignStudio from "@/components/product/DesignStudio";
import { Heart, Star, Truck } from "@/components/ui/icons";
import { hexFor, inr, type Method, type Product } from "@/lib/catalog";
import { METHOD_PRICE } from "@/lib/cart-store";
import { AREAS, VIEWBOX, type AreaId, type Design } from "@/lib/design";
import { useCart } from "@/lib/cart-store";
import { readSizeProfile, sizeKeyFor } from "@/lib/profile";
import { SIZE_CHART } from "@/lib/account";
import { useRouter, useSearchParams } from "next/navigation";
import { saveDesigns, takePending } from "@/lib/designs-store";
import { useDialog } from "@/lib/use-dialog";
import { DEMO_MODE } from "@/lib/demo";

const pct = (v: number, total: number) => (v / total) * 100 + "%";

export default function ProductView({ product }: { product: Product }) {
  const [area, setArea] = useState<AreaId>("front");
  const [designs, setDesigns] = useState<Partial<Record<AreaId, Design>>>({});
  const [colour, setColour] = useState(product.colours[0]);
  const [size, setSize] = useState(product.sizes.includes("M") ? "M" : product.sizes[0]);
  const [method, setMethod] = useState<Method>(product.methods[0]);
  const [saved, setSaved] = useState<string[]>([]);
  const [pincode, setPincode] = useState("");
  const [eta, setEta] = useState<string | null>(null);
  const [pinError, setPinError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);
  const [fromProfile, setFromProfile] = useState(false);
  const [sizeGuide, setSizeGuide] = useState(false);
  const [savedNote, setSavedNote] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const { addLine, lines } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dialogRef = useDialog<HTMLDivElement>(sizeGuide, () => setSizeGuide(false));

  // Designs handed over from the studio, or an existing cart line being edited.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (searchParams.get("design") === "studio") {
      const pending = takePending();
      if (pending && pending.slug === product.slug) {
        setDesigns(pending.designs);
        if (pending.colour && product.colours.includes(pending.colour)) {
          setColour(pending.colour);
        }
        const first = AREAS.find((a) => pending.designs[a.id]);
        if (first) setArea(first.id);
      }
      return;
    }
    const lineId = searchParams.get("line");
    if (!lineId) return;
    const line = lines.find((l) => l.id === lineId);
    if (!line || line.slug !== product.slug) return;
    setDesigns(Object.fromEntries(line.designs.map((d) => [d.area, d.design])));
    setColour(line.colour);
    setSize(line.size as typeof size);
    setMethod(line.method);
    setQty(line.qty);
    const first = AREAS.find((a) => line.designs.some((d) => d.area === a.id));
    if (first) setArea(first.id);
  }, [searchParams, product.slug, product.colours, lines]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // The size profile lives in localStorage, so it can only be read after mount.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const profile = readSizeProfile();
    if (!profile) return;
    const preferred = profile[sizeKeyFor(product.kind)];
    if (preferred && product.sizes.includes(preferred as never)) {
      setSize(preferred as typeof size);
      setFromProfile(true);
    }
  }, [product.kind, product.sizes]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const current = AREAS.find((a) => a.id === area)!;
  const decorated = AREAS.filter((a) => designs[a.id]);
  const decorationTotal = decorated.length * METHOD_PRICE[method];
  const total = (product.price + decorationTotal) * qty;

  const apply = (d: Design) => setDesigns((prev) => ({ ...prev, [area]: d }));
  const clearArea = () =>
    setDesigns((prev) => {
      const next = { ...prev };
      delete next[area];
      return next;
    });

  const checkPin = () => {
    if (!/^\d{6}$/.test(pincode.trim())) {
      setPinError("Enter a valid 6-digit pincode.");
      setEta(null);
      return;
    }
    setPinError(null);
    const days = 4 + (Number(pincode.trim().slice(-1)) % 3);
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() + days);
    setEta(
      d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })
    );
  };

  const off = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  const buildLine = () => ({
    slug: product.slug,
    colour,
    size,
    method,
    designs: decorated.map((a) => ({
      area: a.id,
      label: a.label,
      design: designs[a.id]!,
    })),
    qty,
    stockLeft: DEMO_MODE ? product.stock : undefined,
  });

  const addToCart = () => {
    if (decorated.length === 0) {
      setCartError("Add a design to at least one print area first.");
      return false;
    }
    setCartError(null);
    addLine(buildLine());
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
    return true;
  };

  const buyNow = () => {
    if (addToCart()) router.push("/checkout");
  };

  return (
    <div className="container-pe grid grid-cols-[minmax(0,1fr)] gap-10 pb-12 pt-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14">
      <div className="min-w-0">
        <div className="grid grid-cols-4 gap-1.5 sm:flex sm:flex-wrap sm:gap-2" role="tablist" aria-label="Print placement">
          {AREAS.map((a) => (
            <button
              key={a.id}
              type="button"
              role="tab"
              aria-selected={area === a.id}
              onClick={() => setArea(a.id)}
              className={
                "relative min-w-0 border px-1.5 py-2 text-[11px] transition-colors sm:px-4 sm:text-[13px] " +
                (area === a.id
                  ? "border-lime bg-lime text-ink"
                  : "border-line bg-white hover:border-ink")
              }
            >
              {a.label}
              {designs[a.id] && (
                <span
                  className={
                    "ml-2 inline-block h-1.5 w-1.5 " + (area === a.id ? "bg-ink" : "bg-lime")
                  }
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
              onClick={clearArea}
              className="absolute right-3 top-3 border border-line bg-white px-3 py-1.5 text-[12px] hover:border-ink"
            >
              Remove design
            </button>
          )}
        </div>

        <ul className="mt-4 grid grid-cols-4 gap-3">
          {AREAS.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => setArea(a.id)}
                aria-label={`View ${a.label}`}
                className={
                  "relative block aspect-square w-full border-2 bg-alt p-2 transition-colors " +
                  (area === a.id ? "border-lime" : "border-transparent hover:border-line")
                }
              >
                <GarmentPhoto
                  kind={product.kind}
                  area={a.id}
                  colour={hexFor(colour)}
                  name={product.name}
                  className="h-full w-full"
                />
                <span className="absolute inset-x-0 bottom-1 text-[10px] text-muted">
                  {a.id === "left" ? "Left" : a.id === "right" ? "Right" : a.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="min-w-0">
        <h1 className="text-[28px] font-medium tracking-[-0.02em] lg:text-[32px]">
          {product.name}
        </h1>
        <p className="mt-1 text-[14px] text-muted">{product.subtitle}</p>

        {DEMO_MODE && <div className="mt-3 flex items-center gap-2">
          <span className="flex" aria-label="Rated 4.6 out of 5">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star key={i} className="h-4 w-4 text-lime" />
            ))}
          </span>
          <span className="text-[13px] text-muted">4.6 · 312 reviews</span>
        </div>}

        <div className="mt-5 flex flex-wrap items-baseline gap-x-3">
          <span className="text-[24px] font-medium">{inr(product.price)}</span>
          <span className="text-[15px] text-muted line-through">{inr(product.mrp)}</span>
          <span className="bg-lime px-2 py-0.5 text-[12px] font-medium text-ink">{off}% off</span>
        </div>
        <p className="mt-1 text-[12px] text-muted">Inclusive of all taxes</p>

        <div className="mt-7 border-t border-line pt-6">
          <p className="text-[13px] text-muted">
            Colour: <span className="text-ink">{colour}</span>
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {product.colours.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={c}
                aria-pressed={colour === c}
                onClick={() => setColour(c)}
                className={
                  "h-9 w-9 border-2 transition-all " +
                  (colour === c ? "border-lime" : "border-line hover:border-muted")
                }
                style={{ backgroundColor: hexFor(c) }}
              />
            ))}
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-baseline justify-between">
            <p className="text-[13px] text-muted">
              Size: <span className="text-ink">{size}</span>
            </p>
            <div className="flex items-center gap-3">
              {fromProfile && (
                <span className="bg-lime px-2 py-0.5 text-[11px] font-medium text-ink">
                  From your size profile
                </span>
              )}
              <button
                type="button"
                onClick={() => setSizeGuide(true)}
                className="text-[13px] underline underline-offset-4"
              >
                Size guide
              </button>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {(["S", "M", "L", "XL", "XXL"] as const).map((s) => {
              const available = product.sizes.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  disabled={!available}
                  aria-pressed={size === s}
                  onClick={() => setSize(s)}
                  className={
                    "h-11 w-14 border text-[14px] transition-colors " +
                    (!available
                      ? "cursor-not-allowed border-line bg-white text-muted/50 line-through"
                      : size === s
                        ? "border-ink bg-ink text-white"
                        : "border-line bg-white hover:border-ink")
                  }
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6">
          <p className="text-[13px] text-muted">Decoration method</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {(["Custom print", "Embroidery"] as Method[]).map((m) => {
              const available = product.methods.includes(m);
              return (
                <button
                  key={m}
                  type="button"
                  disabled={!available}
                  aria-pressed={method === m}
                  onClick={() => setMethod(m)}
                  className={
                    "border-2 px-4 py-3 text-left transition-colors " +
                    (!available
                      ? "cursor-not-allowed border-line bg-alt text-muted"
                      : method === m
                        ? "border-lime bg-white"
                        : "border-line bg-white hover:border-ink")
                  }
                >
                  <span className="block text-[14px]">{m}</span>
                  <span className="mt-0.5 block text-[12px] text-muted">
                    {available ? `From ${inr(METHOD_PRICE[m])} per area` : "Not available on this"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-7">
          <DesignStudio
            areaLabel={current.label}
            onApply={apply}
            saved={saved}
            onToggleSave={(k) =>
              setSaved((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]))
            }
          />
        </div>

        <div className="mt-6 border border-line p-5">
          <div className="flex justify-between text-[14px]">
            <span className="text-muted">Base garment</span>
            <span>{inr(product.price)}</span>
          </div>
          <div className="mt-2 flex justify-between gap-4 text-[14px]">
            <span className="text-muted">
              {decorated.length === 0
                ? "Decoration"
                : `Decoration (${decorated.map((a) => a.label.toLowerCase()).join(", ")})`}
            </span>
            <span>{decorationTotal === 0 ? "—" : inr(decorationTotal)}</span>
          </div>
          <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
            <span className="text-[15px]">Total</span>
            <span className="text-[20px] font-medium">{inr(total)}</span>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-4">
          <span className="text-[13px] text-muted">Quantity</span>
          <div className="flex items-center border border-line">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={qty <= 1}
              aria-label="Decrease quantity"
              className="h-10 w-10 text-[16px] disabled:text-muted/40"
            >
              −
            </button>
            <span className="w-10 text-center text-[14px]" aria-live="polite">
              {qty}
            </span>
            <button
              type="button"
              onClick={() => setQty((q) => Math.min(10, q + 1))}
              disabled={qty >= 10}
              aria-label="Increase quantity"
              className="h-10 w-10 text-[16px] disabled:text-muted/40"
            >
              +
            </button>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <button
            type="button"
            onClick={addToCart}
            className="h-12 w-full bg-ink text-btn text-white transition-opacity hover:opacity-90"
          >
            {added ? "Added to cart" : "Add to cart"}
          </button>
          <button
            type="button"
            onClick={buyNow}
            className="h-12 w-full bg-lime text-btn text-ink transition-opacity hover:opacity-90"
          >
            Buy now
          </button>
          <button
            type="button"
            onClick={() => {
              if (decorated.length === 0) {
                setSavedNote("Create a design first, then you can save it.");
                return;
              }
              const added = saveDesigns(decorated.map((a) => designs[a.id]!));
              setSavedNote(
                added > 0
                  ? `Saved ${added} design${added === 1 ? "" : "s"} — reorder on any garment.`
                  : "Already in your designs."
              );
            }}
            className="flex h-12 w-full items-center justify-center gap-2 border border-ink text-btn transition-colors hover:bg-ink hover:text-white"
          >
            <Heart className="h-4 w-4" /> Save this design
          </button>
          {savedNote && (
            <p className="text-[13px] text-muted" aria-live="polite">
              {savedNote}{" "}
              <Link href="/account/designs" className="underline underline-offset-4">
                View my designs
              </Link>
            </p>
          )}
        </div>

        {cartError && <p className="mt-3 text-[13px] text-[#a32d2d]">{cartError}</p>}
        {added && (
          <p className="mt-3 text-[13px] text-[#5f7f06]" aria-live="polite">
            Added to your cart — <a href="/cart" className="underline underline-offset-4">view cart</a>
          </p>
        )}

        <div className="mt-6 border border-line p-5">
          <p className="flex items-center gap-2 text-[13px] text-muted">
            <Truck className="h-4 w-4" /> Delivery estimate
          </p>
          <div className="mt-3 flex gap-0">
            <label htmlFor="pe-pin" className="sr-only">
              Pincode
            </label>
            <input
              id="pe-pin"
              inputMode="numeric"
              value={pincode}
              onChange={(e) => {
                setPincode(e.target.value);
                if (pinError) setPinError(null);
              }}
              placeholder="Enter pincode"
              className="h-11 min-w-0 flex-1 border border-line px-3 text-[14px] focus:border-ink focus:outline-none"
            />
            <button
              type="button"
              onClick={checkPin}
              className="h-11 shrink-0 bg-ink px-5 text-btn text-white"
            >
              Check
            </button>
          </div>
          {pinError && <p className="mt-2 text-[13px] text-[#a32d2d]">{pinError}</p>}
          {eta && (
            <p className="mt-3 text-[13px] text-[#5f7f06]">Delivered by {eta}</p>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 z-40 border-t border-line bg-white py-3 lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0">
            <p className="truncate text-[12px] text-muted">
              {size} · {decorated.length}{" "}
              {decorated.length === 1 ? "area" : "areas"}
            </p>
            <p className="text-[17px] font-medium">{inr(total)}</p>
          </div>
          <button
            type="button"
            onClick={addToCart}
            className="h-12 flex-1 bg-lime text-btn text-ink"
          >
            {added ? "Added" : "Add to cart"}
          </button>
        </div>
      </div>

      {sizeGuide && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center">
          <div
            className="absolute inset-0 bg-ink/50"
            onClick={() => setSizeGuide(false)}
            aria-hidden
          />
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Size guide"
            tabIndex={-1}
            className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto border border-line bg-white p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-[18px] font-medium">Size guide</h2>
              <button
                type="button"
                onClick={() => setSizeGuide(false)}
                aria-label="Close size guide"
                className="text-[20px] leading-none text-muted hover:text-ink"
              >
                ×
              </button>
            </div>
            <p className="mt-2 text-[13px] text-muted">
              Measurements in centimetres, taken flat across the garment.
            </p>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[380px] text-[13px]">
                <thead>
                  <tr className="bg-alt text-left text-muted">
                    <th className="p-3 font-normal">Size</th>
                    <th className="p-3 font-normal">Chest</th>
                    <th className="p-3 font-normal">Length</th>
                    <th className="p-3 font-normal">Shoulder</th>
                  </tr>
                </thead>
                <tbody>
                  {SIZE_CHART.map((r) => (
                    <tr
                      key={r.size}
                      className={"border-t border-line " + (size === r.size ? "bg-lime/20" : "")}
                    >
                      <td className="p-3">{r.size}</td>
                      <td className="p-3 text-muted">{r.chest} cm</td>
                      <td className="p-3 text-muted">{r.length} cm</td>
                      <td className="p-3 text-muted">{r.shoulder} cm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Link
              href="/guides/size-chart"
              className="mt-5 inline-block text-[13px] underline underline-offset-4"
            >
              How to measure
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
