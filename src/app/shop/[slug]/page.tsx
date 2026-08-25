import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CollectionShell from "@/components/shop/CollectionShell";
import { categories } from "@/lib/catalog";
import { commerceProducts } from "@/lib/commerce-catalog";

export const dynamic = "force-dynamic";
import { detailMetadata } from "@/lib/metadata";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) return {};
  return detailMetadata(`Custom ${cat.name.toLowerCase()}`, cat.blurb, `/shop/${cat.slug}`);
}

export default async function Page({ params }: Params) {
  const { slug } = await params;
  const products = await commerceProducts();
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) notFound();

  const pool = products.filter((p) => p.category === cat.slug);

  return (
    <CollectionShell
      title={cat.name}
      crumbs={[
        { label: "Home", href: "/" },
        { label: "Shop", href: "/shop" },
        { label: cat.name },
      ]}
      intro={cat.subtitle + " — printed or embroidered to order, with no minimum quantity."}
      blurb={cat.blurb}
      pool={pool}
      relatedExclude={cat.slug}
    />
  );
}
