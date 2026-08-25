import Link from "next/link";
import ProductCard from "@/components/ui/ProductCard";
import { ArrowRight } from "@/components/ui/icons";
import type { Product } from "@/lib/catalog";

export default function Bestsellers({ products }: { products: Product[] }) {
  const items = products.filter((p) => p.bestseller);

  return (
    <section className="section-pe" aria-labelledby="best-heading">
      <div className="container-pe">
        <div className="flex items-end justify-between gap-6">
          <h2 id="best-heading" className="text-h2">
            Bestsellers
          </h2>
          <Link
            href="/shop"
            className="flex shrink-0 items-center gap-2 text-[14px] underline-offset-4 hover:underline"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <ul className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible">
          {items.map((p) => (
            <li
              key={p.slug}
              className="w-[68%] shrink-0 snap-start sm:w-[42%] lg:w-auto lg:shrink"
            >
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
