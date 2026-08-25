import type { Metadata } from "next";
import StorefrontShell from "@/components/layout/StorefrontShell";
import OrderTracking from "@/components/order/OrderTracking";
import { order } from "@/lib/orders";

export function generateStaticParams() {
  return [{ id: order.id }];
}

export const metadata: Metadata = {
  title: "Track your order",
  description: "Follow your printengine order from artwork check to delivery.",
  robots: { index: false, follow: false },
};

export default async function Page({ params,searchParams }: { params: Promise<{ id: string }>;searchParams:Promise<{access?:string}> }) {
  const { id } = await params;
  const {access}=await searchParams;
  return (
    <StorefrontShell>
        <OrderTracking orderId={id} accessToken={access} />
    </StorefrontShell>
  );
}
