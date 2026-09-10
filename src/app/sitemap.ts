import type { MetadataRoute } from "next";
import { categories, products as fallbackProducts } from "@/lib/catalog";
import { commerceProducts } from "@/lib/commerce-catalog";
import { guides, policies } from "@/lib/content";

const BASE = "https://www.printengine.in";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Railway builds run before the private database network is available. Keep
  // sitemap generation deploy-safe while still using the live catalogue when
  // the database can be reached (for example during runtime regeneration).
  const products = await commerceProducts().catch(() => fallbackProducts);
  const staticPages = [
    { path: "", priority: 1 },
    { path: "/shop", priority: 0.9 },
    { path: "/studio", priority: 0.9 },
    { path: "/embroidery", priority: 0.7 },
    { path: "/bulk-orders", priority: 0.7 },
    { path: "/offers", priority: 0.7 },
    { path: "/guides", priority: 0.5 },
    { path: "/policies", priority: 0.3 },
  ];

  return [
    ...staticPages.map((p) => ({
      url: BASE + p.path,
      changeFrequency: "weekly" as const,
      priority: p.priority,
    })),
    ...categories.map((c) => ({
      url: `${BASE}/shop/${c.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...products.map((p) => ({
      url: `${BASE}/product/${p.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...guides.map((g) => ({
      url: `${BASE}/guides/${g.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    ...policies.map((p) => ({
      url: `${BASE}/policies/${p.slug}`,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
