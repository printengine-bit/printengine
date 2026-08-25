import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import StorefrontShell from "@/components/layout/StorefrontShell";
import ProductView from "@/components/product/ProductView";
import ProductInfo from "@/components/product/ProductInfo";
import RecentlyViewed from "@/components/product/RecentlyViewed";
import { categories, products } from "@/lib/catalog";
import { detailMetadata } from "@/lib/metadata";
import { commerceProducts } from "@/lib/commerce-catalog";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const p = products.find((x) => x.slug === slug);
  if (!p) return {};
  const description = `${p.name} — ${p.subtitle}. Add your own print or generate one with AI, on the front, back or either sleeve. From ₹${p.price} with 48-hour dispatch.`;
  return detailMetadata(p.name, description, `/product/${p.slug}`);
}

export default async function Page({ params }: Params) {
  const { slug } = await params;
  const liveProducts = await commerceProducts();
  const product = liveProducts.find((p) => p.slug === slug);
  if (!product) notFound();

  const cat = categories.find((c) => c.slug === product.category)!;
  const related = liveProducts
    .filter((p) => p.slug !== product.slug && p.category === product.category)
    .slice(0, 4);

  return (
    <StorefrontShell>
        <div className="container-pe pt-6">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 text-[13px] text-muted">
              <li className="flex items-center gap-2">
                <Link href="/" className="underline-offset-4 hover:text-ink hover:underline">
                  Home
                </Link>
                <span aria-hidden>/</span>
              </li>
              <li className="flex items-center gap-2">
                <Link href="/shop" className="underline-offset-4 hover:text-ink hover:underline">
                  Shop
                </Link>
                <span aria-hidden>/</span>
              </li>
              <li className="flex items-center gap-2">
                <Link
                  href={`/shop/${cat.slug}`}
                  className="underline-offset-4 hover:text-ink hover:underline"
                >
                  {cat.name}
                </Link>
                <span aria-hidden>/</span>
              </li>
              <li className="text-ink">{product.name}</li>
            </ol>
          </nav>
        </div>

        <Suspense
          fallback={
            <div className="container-pe py-10">
              <div className="h-96 animate-pulse border border-line bg-alt" aria-hidden />
            </div>
          }
        >
          <ProductView product={product} />
        </Suspense>
        <ProductInfo product={product} related={related} />
        <RecentlyViewed currentSlug={product.slug} />
    </StorefrontShell>
  );
}
