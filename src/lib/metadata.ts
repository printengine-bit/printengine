import type { Metadata } from "next";

const BASE = "https://www.printengine.in";

export function detailMetadata(title: string, description: string, path: string): Metadata {
  const url = new URL(path, BASE).toString();
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "printengine",
      locale: "en_IN",
      type: "website",
      images: [],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [],
    },
  };
}
