import StorefrontShell from "@/components/layout/StorefrontShell";

import Hero from "@/components/home/Hero";
import CategoryGrid from "@/components/home/CategoryGrid";
import StudioBand from "@/components/home/StudioBand";
import Bestsellers from "@/components/home/Bestsellers";
import AllProducts from "@/components/home/AllProducts";
import TechniqueSplit from "@/components/home/TechniqueSplit";
import TrustStrip from "@/components/home/TrustStrip";
import Reviews from "@/components/home/Reviews";
import { commerceProducts } from "@/lib/commerce-catalog";
import { storeConfiguration } from "@/lib/store-configuration";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [products,{content}]=await Promise.all([commerceProducts(),storeConfiguration()]);
  return (
    <StorefrontShell announcement={content.announcement}>
        <Hero title={content.hero_title} copy={content.hero_body} />
        <CategoryGrid />
        <StudioBand />
        <Bestsellers products={products} />
        <AllProducts products={products} />
        <TechniqueSplit />
        <TrustStrip />
        <Reviews />
    </StorefrontShell>
  );
}
