import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import AdminShell from "@/components/admin/AdminShell";
import { adminPageUser,money } from "@/lib/admin";
import { db } from "@/lib/db";

export default async function Page({params}:{params:Promise<{id:string}>}){
  await adminPageUser();const {id}=await params;if(!z.string().uuid().safeParse(id).success)notFound();
  const orders=await db()<Array<{number:string;email:string;phone:string;shipping_address:Record<string,string>;status:string;payment_status:string;grand_total:number;notes:string|null}>>`SELECT number,email,phone,shipping_address,status,payment_status,grand_total,notes FROM orders WHERE id=${id}`;
  const order=orders[0];if(!order)notFound();
  const [items,events]=await Promise.all([
    db()<Array<{id:string;product_name:string;sku:string;quantity:number;unit_price:number;decoration_price:number;designs:unknown}>>`SELECT id,product_name,sku,quantity,unit_price,decoration_price,designs FROM order_items WHERE order_id=${id} ORDER BY created_at`,
    db()<Array<{id:string;event:string;created_at:Date}>>`SELECT id,event,created_at FROM order_events WHERE order_id=${id} ORDER BY created_at DESC`,
  ]);
  return <AdminShell title={order.number} active="/admin/orders"><Link href="/admin/orders" className="underline">Back to orders</Link><div className="mt-5 grid gap-5 lg:grid-cols-2"><section className="border border-line bg-white p-5"><h2 className="font-medium">Customer and delivery</h2><p className="mt-3 break-all">{order.email}</p><p>{order.phone}</p><address className="mt-3 not-italic">{["name","line1","line2","city","state","postalCode"].map(key=><p key={key}>{order.shipping_address[key]}</p>)}</address>{order.notes&&<p className="mt-3">Notes: {order.notes}</p>}</section><section className="border border-line bg-white p-5"><h2 className="font-medium">Payment and production</h2><p className="mt-3">Payment: {order.payment_status}</p><p>Order: {order.status}</p><p className="mt-3 text-xl">{money(order.grand_total)}</p><p className="mt-3 text-sm text-muted">Refunds and cancellations require payment reconciliation. A status edit does not move money.</p></section></div><section className="mt-5 space-y-3"><h2 className="text-xl font-medium">Order items and design specifications</h2>{items.map(item=><article key={item.id} className="border border-line bg-white p-5"><h3 className="font-medium">{item.product_name}</h3><p className="text-sm text-muted">SKU {item.sku} · Quantity {item.quantity} · {money((item.unit_price+item.decoration_price)*item.quantity)}</p><details className="mt-3"><summary className="cursor-pointer">View saved artwork specifications</summary><pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap break-all bg-alt p-3 text-xs">{JSON.stringify(item.designs,null,2)}</pre></details></article>)}</section><section className="mt-5 border border-line bg-white p-5"><h2 className="font-medium">Order timeline</h2>{events.map(event=><p key={event.id} className="mt-3 text-sm">{new Date(event.created_at).toISOString()} · {event.event.replaceAll("_"," ")}</p>)}{!events.length&&<p className="mt-3 text-muted">No events recorded yet.</p>}</section></AdminShell>;
}
