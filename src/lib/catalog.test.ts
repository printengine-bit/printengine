import { describe, expect, it } from "vitest";
import { megaMenu, products } from "@/lib/catalog";

const expandedProductSlugs = [
  "oversized-black", "oversized-off-white", "oversized-grey", "oversized-olive",
  "oversized-brown", "oversized-navy", "vintage-washed-tee", "minimal-logo-tee",
  "streetwear-oversized-hoodie", "boxy-sweatshirt", "cargo-pants", "varsity-jacket",
  "pro-football-jersey", "basketball-jersey", "oversized-sports-tee", "dry-fit-gym-tee",
  "premium-cap", "tote-bag", "crossbody-bag", "crew-socks",
];

describe("commerce catalogue", () => {
  it("has unique slugs and sellable variants for every product", () => {
    expect(new Set(products.map((product) => product.slug)).size).toBe(products.length);
    for (const product of products) {
      expect(product.colours.length).toBeGreaterThan(0);
      expect(product.sizes.length).toBeGreaterThan(0);
      expect(product.price).toBeGreaterThan(0);
      expect(product.mrp).toBeGreaterThanOrEqual(product.price);
    }
  });

  it("contains the expanded catalogue", () => expect(products).toHaveLength(43));

  it("never links a menu item to a missing product", () => {
    const known = new Set(products.map((product) => product.slug));
    const productLinks = Object.values(megaMenu)
      .flatMap((columns) => columns.flatMap((column) => column.links))
      .map((link) => link.href.match(/^\/product\/([^?]+)/)?.[1])
      .filter((slug): slug is string => Boolean(slug));
    expect(productLinks.every((slug) => known.has(slug))).toBe(true);
  });

  it("exposes every newly added retail product in the adult menus", () => {
    for (const audience of ["Men", "Women"] as const) {
      const hrefs = new Set(
        megaMenu[audience].flatMap((column) => column.links.map((link) => link.href))
      );
      for (const slug of expandedProductSlugs) {
        expect(hrefs.has(`/product/${slug}`), `${audience} menu is missing ${slug}`).toBe(true);
      }
    }
  });
});
