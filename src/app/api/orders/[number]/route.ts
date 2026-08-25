import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { sessionUser } from "@/lib/auth";
import { databaseConfigured, db } from "@/lib/db";

type OrderRow={id:string;number:string;customer_id:string|null;status:string;payment_status:string;fulfillment_status:string;subtotal:number;decoration_total:number;discount_total:number;shipping_total:number;grand_total:number;discount_code:string|null;shipping_address:Record<string,string>;tracking_number:string|null;created_at:Date};
type ItemRow={id:string;slug:string;colour:string;size:string;method:"Custom print"|"Embroidery";quantity:number;designs:Array<{area:string;label:string;design:unknown}>};

export async function GET(request:Request,{params}:{params:Promise<{number:string}>}){
  if(!databaseConfigured())return NextResponse.json({error:"Order service unavailable."},{status:503});
  const {number}=await params;const user=await sessionUser();const token=new URL(request.url).searchParams.get("access");
  const tokenHash=token?createHash("sha256").update(token).digest("hex"):null;
  const orders=await db()<OrderRow[]>`SELECT id,number,customer_id,status,payment_status,fulfillment_status,subtotal,decoration_total,discount_total,shipping_total,grand_total,discount_code,shipping_address,tracking_number,created_at FROM orders WHERE number=${number} AND (customer_id=${user?.id??null} OR (${tokenHash}::text IS NOT NULL AND access_token_hash=${tokenHash})) LIMIT 1`;
  const order=orders[0];if(!order)return NextResponse.json({error:"Order not found."},{status:404});
  const items=await db()<ItemRow[]>`SELECT i.id,p.slug,i.colour,i.size,i.method,i.quantity,i.designs FROM order_items i JOIN products p ON p.id=i.product_id WHERE i.order_id=${order.id} ORDER BY i.created_at`;
  return NextResponse.json({order:{
    id:order.number,status:order.status,paymentStatus:order.payment_status,fulfillmentStatus:order.fulfillment_status,
    placedOn:new Date(order.created_at).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"}),
    lines:items.map(item=>({id:item.id,slug:item.slug,colour:item.colour,size:item.size,method:item.method,qty:item.quantity,designs:item.designs})),
    totals:{subtotal:order.subtotal,decoration:order.decoration_total,discount:order.discount_total,shipping:order.shipping_total,total:order.grand_total},
    coupon:order.discount_code,address:order.shipping_address,trackingNumber:order.tracking_number,
  }},{headers:{"cache-control":"no-store"}});
}
