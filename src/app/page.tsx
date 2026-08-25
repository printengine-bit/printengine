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

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await commerceProducts();
  return (
    <StorefrontShell>
        <Hero />
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
