import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ContentShell from "@/components/layout/ContentShell";
import { guides, findContent } from "@/lib/content";
import { detailMetadata } from "@/lib/metadata";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return guides.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const page = findContent(guides, slug);
  if (!page) return {};
  return detailMetadata(page.title, page.intro, `/guides/${page.slug}`);
}

export default async function Page({ params }: Params) {
  const { slug } = await params;
  const page = findContent(guides, slug);
  if (!page) notFound();
  return (
    <ContentShell
      page={page}
      crumbLabel="Guides"
      crumbHref="/guides"
      related={guides.map((c) => ({ title: c.title, href: "/guides/" + c.slug }))}
    />
  );
}
