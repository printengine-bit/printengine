import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ContentShell from "@/components/layout/ContentShell";
import { policies, findContent } from "@/lib/content";
import { detailMetadata } from "@/lib/metadata";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return policies.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const page = findContent(policies, slug);
  if (!page) return {};
  return detailMetadata(page.title, page.intro, `/policies/${page.slug}`);
}

export default async function Page({ params }: Params) {
  const { slug } = await params;
  const page = findContent(policies, slug);
  if (!page) notFound();
  return (
    <ContentShell
      page={page}
      crumbLabel="Information"
      crumbHref="/policies"
      related={policies.map((c) => ({ title: c.title, href: "/policies/" + c.slug }))}
    />
  );
}
