import Link from "next/link";
import StorefrontShell from "@/components/layout/StorefrontShell";
import ProductCard from "@/components/ui/ProductCard";
import type { Product } from "@/lib/catalog";

export default function LandingShell({
  eyebrow,
  title,
  intro,
  primary,
  secondary,
  blocks,
  products,
  productsHeading,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
  blocks: { heading: string; body: string }[];
  products?: Product[];
  productsHeading?: string;
  children?: React.ReactNode;
}) {
  return (
    <StorefrontShell>
        <section className="bg-ink text-white">
          <div className="container-pe py-16 lg:py-20">
            <p className="text-[12px] uppercase tracking-[0.14em] text-lime">{eyebrow}</p>
            <h1 className="mt-4 max-w-2xl text-h1m lg:text-h1">{title}</h1>
            <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-white/70">{intro}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href={primary.href}
                className="flex h-12 items-center bg-lime px-7 text-btn text-ink transition-opacity hover:opacity-90"
              >
                {primary.label}
              </Link>
              {secondary && (
                <Link
                  href={secondary.href}
                  className="flex h-12 items-center border border-white/30 px-7 text-btn text-white transition-colors hover:bg-white hover:text-ink"
                >
                  {secondary.label}
                </Link>
              )}
            </div>
          </div>
        </section>

        {children}

        <section className="section-pe">
          <div className="container-pe grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {blocks.map((b) => (
              <div key={b.heading} className="border-t border-ink pt-5">
                <h2 className="text-[16px] font-medium">{b.heading}</h2>
                <p className="mt-2 text-[14px] leading-relaxed text-muted">{b.body}</p>
              </div>
            ))}
          </div>
        </section>

        {products && products.length > 0 && (
          <section className="border-t border-line bg-alt">
            <div className="container-pe section-pe">
              <h2 className="text-h2">{productsHeading ?? "Shop these"}</h2>
              <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-6">
                {products.map((p) => (
                  <li key={p.slug}>
                    <ProductCard product={p} showSwatches />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
    </StorefrontShell>
  );
}
