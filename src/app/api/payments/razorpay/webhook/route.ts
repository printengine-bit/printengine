import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { db, databaseConfigured } from "@/lib/db";
import { markOrderPaid } from "@/lib/order-payment";
export async function POST(request:Request){
  if(!databaseConfigured()||!process.env.RAZORPAY_WEBHOOK_SECRET)return NextResponse.json({error:"Webhook unavailable."},{status:503});
  const raw=await request.text();const signature=request.headers.get("x-razorpay-signature")??"";
  const expected=createHmac("sha256",process.env.RAZORPAY_WEBHOOK_SECRET).update(raw).digest();const received=Buffer.from(signature,"hex");
  if(received.length!==expected.length||!timingSafeEqual(received,expected))return NextResponse.json({error:"Invalid signature."},{status:401});
  const event=JSON.parse(raw) as {event?:string;payload?:{payment?:{entity?:{id?:string;order_id?:string}}}};const payment=event.payload?.payment?.entity;
  if(event.event==="payment.captured"&&payment?.order_id)await markOrderPaid(payment.order_id,payment.id??null);
  if(event.event==="payment.failed"&&payment?.order_id)await db()`UPDATE orders SET payment_status='failed',updated_at=now() WHERE razorpay_order_id=${payment.order_id}`;
  return NextResponse.json({ok:true});
}
