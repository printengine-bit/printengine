import type { Metadata } from "next";
import { CheckoutFooter, CheckoutHeader, Stepper } from "@/components/checkout/CheckoutChrome";
import CheckoutView from "@/components/checkout/CheckoutView";
import { shippingPolicy,storeConfiguration } from "@/lib/store-configuration";
import { commerceProducts } from "@/lib/commerce-catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Secure checkout",
  description: "Complete your printengine order.",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const [configuration,products]=await Promise.all([storeConfiguration(),commerceProducts()]);
  const policy=shippingPolicy(configuration.settings);
  return (
    <div className="flex min-h-screen flex-col">
      <CheckoutHeader />
      <Stepper current={1} />
      <main id="main" className="flex-1">
        <h1 className="sr-only">Secure checkout</h1>
        <CheckoutView shippingPolicy={policy} products={products} />
      </main>
      <CheckoutFooter />
    </div>
  );
}
