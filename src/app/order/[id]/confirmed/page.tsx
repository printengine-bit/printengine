import type { Metadata } from "next";
import StorefrontShell from "@/components/layout/StorefrontShell";
import OrderConfirmed from "@/components/order/OrderConfirmed";
import { order } from "@/lib/orders";

export function generateStaticParams() {
  return [{ id: order.id }];
}

export const metadata: Metadata = {
  title: "Order confirmed",
  description: "Your printengine order has been confirmed.",
  robots: { index: false, follow: false },
};

export default async function Page({ params,searchParams }: { params: Promise<{ id: string }>;searchParams:Promise<{access?:string}> }) {
  const { id } = await params;
  const {access}=await searchParams;
  return (
    <StorefrontShell>
        <OrderConfirmed orderId={id} accessToken={access} />
    </StorefrontShell>
  );
}
