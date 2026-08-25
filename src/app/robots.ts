import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/account", "/account/", "/checkout", "/cart", "/order/"],
      },
    ],
    sitemap: "https://www.printengine.in/sitemap.xml",
    host: "https://www.printengine.in",
  };
}
