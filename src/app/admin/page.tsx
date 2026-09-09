import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { adminPageUser, money, shortDate } from "@/lib/admin";
import { db } from "@/lib/db";

type Stats={orders:number;revenue:number;customers:number;products:number;low_stock:number;pending_artwork:number;unpaid:number;shipment_failures:number};
type OrderRow={id:string;number:string;email:string;grand_total:number;status:string;payment_status:string;created_at:Date};
type StockRow={product_id:string;product_name:string;sku:string;sellable:number;low_stock_at:number};

export default async function Page(){
  await adminPageUser();
  const [summary,recentOrders,lowStock]=await Promise.all([
    db()<Stats[]>`SELECT (SELECT count(*)::int FROM orders) orders,(SELECT coalesce(sum(grand_total),0)::int FROM orders WHERE payment_status='paid') revenue,(SELECT count(*)::int FROM users WHERE role='customer') customers,(SELECT count(*)::int FROM products WHERE status='active') products,(SELECT count(*)::int FROM product_variants WHERE active=true AND stock-reserved_stock<=low_stock_at) low_stock,(SELECT count(*)::int FROM artworks WHERE status='pending') pending_artwork,(SELECT count(*)::int FROM orders WHERE payment_status='pending') unpaid,(SELECT count(*)::int FROM orders WHERE shipment_error IS NOT NULL) shipment_failures`,
    db()<OrderRow[]>`SELECT id,number,email,grand_total,status,payment_status,created_at FROM orders ORDER BY created_at DESC LIMIT 8`,
    db()<StockRow[]>`SELECT p.id product_id,p.name product_name,v.sku,(v.stock-v.reserved_stock)::int sellable,v.low_stock_at FROM product_variants v JOIN products p ON p.id=v.product_id WHERE v.active=true AND v.stock-v.reserved_stock<=v.low_stock_at ORDER BY (v.stock-v.reserved_stock),p.name LIMIT 8`,
  ]);
  const stats=summary[0];const cards:[[string,string|number,string],...Array<[string,string|number,string]>]=[["Paid revenue",money(stats.revenue),"/admin/orders"],["Orders",stats.orders,"/admin/orders"],["Customers",stats.customers,"/admin/customers"],["Active products",stats.products,"/admin/products"],["Low-stock variants",stats.low_stock,"/admin/inventory?state=low"],["Artwork awaiting review",stats.pending_artwork,"/admin/artwork"]];
  return <AdminShell title="Store overview" active="/admin">
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{cards.map(([label,value,href])=><Link href={href} key={label} className="border border-line bg-white p-6 transition hover:border-ink"><p className="text-[12px] uppercase tracking-[0.1em] text-muted">{label}</p><p className="mt-3 text-[30px] font-medium tracking-[-0.03em]">{value}</p></Link>)}</section>
    {(stats.unpaid>0||stats.shipment_failures>0)&&<section className="mt-6 border border-[#d9a6a6] bg-[#fff7f7] p-5"><h2 className="font-medium text-[#8d2525]">Needs attention</h2><div className="mt-3 flex flex-wrap gap-5 text-[13px]"><Link href="/admin/orders" className="underline underline-offset-4">{stats.unpaid} unpaid orders</Link><Link href="/admin/orders" className="underline underline-offset-4">{stats.shipment_failures} shipment failures</Link></div></section>}
    <div className="mt-6 grid gap-6 xl:grid-cols-2">
      <section className="border border-line bg-white"><div className="flex items-center justify-between border-b border-line p-5"><h2 className="text-lg font-medium">Recent orders</h2><Link href="/admin/orders" className="text-[12px] underline">View all</Link></div><div className="divide-y divide-line">{recentOrders.map(order=><Link href={`/admin/orders/${order.id}`} key={order.id} className="grid grid-cols-[1fr_auto] gap-3 p-4 hover:bg-alt"><div><p className="font-medium">{order.number}</p><p className="mt-1 text-[12px] text-muted">{order.email} · {shortDate(order.created_at)}</p></div><div className="text-right"><p>{money(order.grand_total)}</p><p className="mt-1 text-[11px] text-muted">{order.payment_status} · {order.status}</p></div></Link>)}{!recentOrders.length&&<p className="p-5 text-muted">No orders yet.</p>}</div></section>
      <section className="border border-line bg-white"><div className="flex items-center justify-between border-b border-line p-5"><h2 className="text-lg font-medium">Low sellable stock</h2><Link href="/admin/inventory?state=low" className="text-[12px] underline">Open inventory</Link></div><div className="divide-y divide-line">{lowStock.map(item=><Link href={`/admin/products/${item.product_id}`} key={item.sku} className="flex items-center justify-between gap-4 p-4 hover:bg-alt"><div><p className="font-medium">{item.product_name}</p><p className="mt-1 text-[12px] text-muted">{item.sku}</p></div><p className="text-right text-[#a32d2d]">{item.sellable} sellable<span className="block text-[11px] text-muted">alert at {item.low_stock_at}</span></p></Link>)}{!lowStock.length&&<p className="p-5 text-muted">All active variants are above their thresholds.</p>}</div></section>
    </div>
  </AdminShell>;
}
