import Link from "next/link";
import { ProductCover } from "@/components/ui/ProductMedia";
import { ArrowRight } from "@/components/ui/icons";
import { categories } from "@/lib/catalog";

const CATEGORY_COVERS: Record<string, { slug: string; name: string }> = {
  "t-shirts": { slug: "classic-half-sleeve-tee", name: "Classic half sleeve t-shirt" },
  hoodies: { slug: "fleece-hoodie", name: "Fleece hoodie" },
  sweatshirts: { slug: "crew-sweatshirt", name: "Crew neck sweatshirt" },
  jerseys: { slug: "dry-fit-jersey", name: "Dry-fit jersey" },
  "doctor-aprons": { slug: "doctor-apron", name: "Doctor apron" },
};

export default function CategoryGrid() {
  return (
    <section className="section-pe" aria-labelledby="cat-heading">
      <div className="container-pe">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 id="cat-heading" className="text-h2">
              Shop by category
            </h2>
            <p className="mt-2 text-[15px] text-muted">
              Seven products, three fits, four print areas.
            </p>
          </div>
          <Link
            href="/shop"
            className="hidden shrink-0 items-center gap-2 text-[14px] underline-offset-4 hover:underline sm:flex"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-5 lg:gap-6">
          {categories.map((c) => (
            <li key={c.slug}>
              <Link href={`/shop/${c.slug}`} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden bg-alt">
                  <ProductCover
                    slug={CATEGORY_COVERS[c.slug].slug}
                    name={CATEGORY_COVERS[c.slug].name}
                    className="transition-transform duration-500 group-hover:scale-[1.035]"
                    sizes="(max-width: 1024px) 50vw, 20vw"
                  />
                  <span className="absolute bottom-3 left-3 bg-white/90 px-2 py-1 text-[10px] uppercase tracking-[0.08em] text-ink">
                    Shop {c.name}
                  </span>
                </div>
                <h3 className="mt-4 inline-block text-[16px] font-medium leading-none decoration-lime decoration-2 underline-offset-[6px] group-hover:underline">
                  {c.name}
                </h3>
                <p className="mt-1.5 text-[13px] text-muted">{c.subtitle}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
