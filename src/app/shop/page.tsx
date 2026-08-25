import type { Metadata } from "next";
import CollectionShell from "@/components/shop/CollectionShell";
import { commerceProducts } from "@/lib/commerce-catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop all products",
  description:
    "Every blank we print on — t-shirts, hoodies, sweatshirts, jerseys and doctor aprons, customisable with AI-generated prints, your own artwork or embroidery.",
};

export default async function Page() {
  const products = await commerceProducts();
  return (
    <CollectionShell
      title="All products"
      crumbs={[{ label: "Home", href: "/" }, { label: "Shop" }]}
      intro="Every blank we print on, across men, women and kids. Filter by fit, size, colour and decoration method."
      blurb="We stock a deliberately tight range so we can hold quality on every piece. Each garment is selected for how it takes ink or thread, then preshrunk and bio-washed so the print you approve is the print that lasts."
      pool={products}
    />
  );
}
