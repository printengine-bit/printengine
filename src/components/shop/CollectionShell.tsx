import { Suspense } from "react";
import Link from "next/link";
import StorefrontShell from "@/components/layout/StorefrontShell";
import CollectionView from "@/components/shop/CollectionView";
import { categories, type Product } from "@/lib/catalog";

export default function CollectionShell({
  title,
  crumbs,
  intro,
  blurb,
  pool,
  relatedExclude,
}: {
  title: string;
  crumbs: { label: string; href?: string }[];
  intro: string;
  blurb: string;
  pool: Product[];
  relatedExclude?: string;
}) {
  const related = categories.filter((c) => c.slug !== relatedExclude).slice(0, 4);

  return (
    <StorefrontShell>
        <div className="container-pe pb-8 pt-6">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 text-[13px] text-muted">
              {crumbs.map((c, i) => (
                <li key={c.label} className="flex items-center gap-2">
                  {c.href ? (
                    <Link href={c.href} className="underline-offset-4 hover:text-ink hover:underline">
                      {c.label}
                    </Link>
                  ) : (
                    <span className="text-ink">{c.label}</span>
                  )}
                  {i < crumbs.length - 1 && <span aria-hidden>/</span>}
                </li>
              ))}
            </ol>
          </nav>

          <div className="mt-6 flex flex-wrap items-baseline gap-x-4 gap-y-2">
            <h1 className="text-h1m lg:text-h1">{title}</h1>
            <p className="text-[14px] text-muted">{pool.length} products</p>
          </div>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">{intro}</p>
        </div>

        <Suspense
          fallback={
            <div className="container-pe py-10">
              <div className="h-96 animate-pulse border border-line bg-alt" aria-hidden />
            </div>
          }
        >
          <CollectionView pool={pool} />
        </Suspense>

        <section className="border-t border-line bg-alt" aria-labelledby="seo-heading">
          <div className="container-pe section-pe">
            <h2 id="seo-heading" className="text-h2">
              About this collection
            </h2>
            <p className="mt-6 max-w-3xl text-[15px] leading-relaxed text-muted">{blurb}</p>
            <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-muted">
              Every piece here is printed or embroidered to order in our own facility, so there is no
              minimum quantity and no compromise on finish. Upload your artwork, or generate one in
              the design studio and place it on the front, back or either sleeve.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <span className="text-[13px] text-muted">Related categories</span>
              {related.map((c) => (
                <Link
                  key={c.slug}
                  href={`/shop/${c.slug}`}
                  className="border border-line bg-white px-4 py-2 text-[13px] transition-colors hover:border-ink"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
    </StorefrontShell>
  );
}
