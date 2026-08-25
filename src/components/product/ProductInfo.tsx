import ProductCard from "@/components/ui/ProductCard";
import Garment from "@/components/ui/Garment";
import { Shield, Star, Truck } from "@/components/ui/icons";
import { reviews, type Product } from "@/lib/catalog";
import { DEMO_MODE } from "@/lib/demo";

const STEPS = [
  {
    n: "1",
    title: "Artwork check",
    copy: "A person reviews your design for resolution and placement before any ink is committed.",
  },
  {
    n: "2",
    title: "Printing",
    copy: "Printed on industrial DTG and DTF machines with water-based, skin-safe inks.",
  },
  {
    n: "3",
    title: "Quality check",
    copy: "Inspected under daylight-balanced lighting for colour accuracy and stitch integrity.",
  },
  {
    n: "4",
    title: "Dispatch",
    copy: "Packed in recyclable packaging and handed to our courier within 48 hours.",
  },
];

function Accordion({
  title,
  children,
  open = false,
}: {
  title: string;
  children: React.ReactNode;
  open?: boolean;
}) {
  return (
    <details open={open} className="group border-b border-line">
      <summary className="flex cursor-pointer list-none items-center justify-between py-5 text-[15px] marker:content-none">
        {title}
        <span className="text-[18px] leading-none text-muted" aria-hidden>
          <span className="group-open:hidden">+</span>
          <span className="hidden group-open:inline">−</span>
        </span>
      </summary>
      <div className="pb-6 text-[14px] leading-relaxed text-muted">{children}</div>
    </details>
  );
}

export default function ProductInfo({
  product,
  related,
}: {
  product: Product;
  related: Product[];
}) {
  return (
    <>
      <section className="border-t border-line">
        <div className="container-pe grid gap-10 py-14 lg:grid-cols-2 lg:gap-16">
          <div>
            <Accordion title="Product details" open>
              <p>
                Constructed from {product.subtitle.toLowerCase()}, built to hold a print without
                fighting it.
              </p>
              <ul className="mt-3 space-y-1.5">
                <li>Preshrunk and bio-washed for consistent sizing</li>
                <li>Reinforced shoulder seams and twin-needle stitching</li>
                <li>Tear-away label so you can rebrand it as your own</li>
                <li>Available in {product.colours.length} colours and {product.sizes.length} sizes</li>
              </ul>
            </Accordion>
            <Accordion title="Fabric and care">
              <p>
                {product.gsm} gsm. Machine wash cold, inside out, with like colours. Do not bleach.
                Tumble dry low. Do not iron directly over the print or embroidery.
              </p>
            </Accordion>
            <Accordion title="Print and embroidery guide">
              <p>
                Prints are applied edge to edge within the marked safe area on each panel. Upload
                artwork at 300 DPI at final print size. Embroidery is limited to text, logos and
                vector shapes — detailed photographic artwork cannot be stitched.
              </p>
            </Accordion>
            <Accordion title="Shipping and returns">
              <p>
                Dispatched within 48 hours, delivered pan-India in 4 to 7 days. Because every piece
                is made to your design, custom orders cannot be returned for a change of mind. We
                reprint free of charge for any print defect, and offer one free size exchange.
              </p>
            </Accordion>
          </div>

          <div className="bg-alt p-8">
            <h2 className="text-[20px] font-medium tracking-[-0.02em]">How your order is made</h2>
            <ol className="mt-6 space-y-6">
              {STEPS.map((s) => (
                <li key={s.n} className="flex gap-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-ink text-[12px]">
                    {s.n}
                  </span>
                  <div>
                    <p className="text-[15px]">{s.title}</p>
                    <p className="mt-1 text-[13px] leading-relaxed text-muted">{s.copy}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 border-t border-line pt-6 text-[13px] text-muted">
              <span className="flex items-center gap-2">
                <Truck className="h-4 w-4" /> 48-hour dispatch
              </span>
              <span className="flex items-center gap-2">
                <Shield className="h-4 w-4" /> Free reprint on defects
              </span>
            </div>
          </div>
        </div>
      </section>

      {DEMO_MODE && <section className="border-t border-line bg-alt" aria-labelledby="pdp-reviews">
        <div className="container-pe section-pe grid gap-10 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-14">
          <div>
            <h2 id="pdp-reviews" className="text-h2">
              Reviews
            </h2>
            <p className="mt-6 text-[40px] font-medium leading-none">4.6</p>
            <span className="mt-3 flex" aria-label="Rated 4.6 out of 5">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="h-4 w-4 text-lime" />
              ))}
            </span>
            <p className="mt-2 text-[13px] text-muted">Based on 312 reviews</p>

            <ul className="mt-6 space-y-2">
              {[
                { star: 5, pctv: 74 },
                { star: 4, pctv: 18 },
                { star: 3, pctv: 5 },
                { star: 2, pctv: 2 },
                { star: 1, pctv: 1 },
              ].map((r) => (
                <li key={r.star} className="flex items-center gap-3">
                  <span className="w-3 text-[12px] text-muted">{r.star}</span>
                  <span className="h-1.5 flex-1 bg-white">
                    <span
                      className="block h-full bg-lime"
                      style={{ width: r.pctv + "%" }}
                    />
                  </span>
                  <span className="w-8 text-right text-[12px] text-muted">{r.pctv}%</span>
                </li>
              ))}
            </ul>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2">
            {reviews.map((r) => (
              <li key={r.name} className="border border-line bg-white">
                <div className="flex h-40 items-center justify-center border-b border-line bg-alt">
                  <Garment kind={r.kind} printArea className="h-full w-auto py-5" />
                </div>
                <div className="p-5">
                  <span className="flex" aria-label="Rated 5 out of 5">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} className="h-3.5 w-3.5 text-lime" />
                    ))}
                  </span>
                  <blockquote className="mt-3 text-[14px] leading-relaxed">{r.quote}</blockquote>
                  <p className="mt-3 text-[12px] text-muted">
                    {r.name} — {r.city}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>}

      {related.length > 0 && (
        <section className="section-pe" aria-labelledby="pdp-related">
          <div className="container-pe">
            <h2 id="pdp-related" className="text-h2">
              You may also like
            </h2>
            <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-6">
              {related.map((p) => (
                <li key={p.slug}>
                  <ProductCard product={p} showSwatches />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
