import AdminShell from "@/components/admin/AdminShell";
import { adminPageUser, money } from "@/lib/admin";
import { db } from "@/lib/db";

type Stats = { orders: number; revenue: number; customers: number; products: number; low_stock: number; pending_artwork: number };

export default async function Page() {
  await adminPageUser();
  const rows = await db()<Stats[]>`
    SELECT
      (SELECT count(*)::int FROM orders) AS orders,
      (SELECT coalesce(sum(grand_total),0)::int FROM orders WHERE payment_status='paid') AS revenue,
      (SELECT count(*)::int FROM users WHERE role='customer') AS customers,
      (SELECT count(*)::int FROM products WHERE status='active') AS products,
      (SELECT count(*)::int FROM product_variants WHERE active=true AND stock <= low_stock_at) AS low_stock,
      (SELECT count(*)::int FROM artworks WHERE status='pending') AS pending_artwork
  `;
  const stats = rows[0];
  const cards = [
    ["Paid revenue", money(stats.revenue)], ["Orders", stats.orders], ["Customers", stats.customers],
    ["Active products", stats.products], ["Low-stock variants", stats.low_stock], ["Artwork awaiting review", stats.pending_artwork],
  ];
  return <AdminShell title="Store overview" active="/admin">
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map(([label, value]) => <div key={label} className="border border-line bg-white p-6"><p className="text-[12px] uppercase tracking-[0.1em] text-muted">{label}</p><p className="mt-3 text-[30px] font-medium tracking-[-0.03em]">{value}</p></div>)}
    </section>
    <section className="mt-6 border border-line bg-ink p-6 text-white lg:p-8"><p className="text-[11px] uppercase tracking-[0.12em] text-lime">Operations checklist</p><h2 className="mt-3 text-[24px] font-medium">Your independent commerce control room</h2><p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-white/65">Catalogue, inventory, promotions, customers, paid orders and production artwork are now managed here. Razorpay and fulfilment credentials activate the external steps without changing the workflow.</p></section>
  </AdminShell>;
}
