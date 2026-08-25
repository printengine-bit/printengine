import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { db, databaseConfigured } from "@/lib/db";
import { markOrderPaid } from "@/lib/order-payment";

type RazorpayEvent={event?:string;payload?:{payment?:{entity?:{id?:string;order_id?:string}}}};

export async function POST(request:Request){
  if(!databaseConfigured()||!process.env.RAZORPAY_WEBHOOK_SECRET)return NextResponse.json({error:"Webhook unavailable."},{status:503});
  const raw=await request.text();const signature=request.headers.get("x-razorpay-signature")??"";
  const expected=createHmac("sha256",process.env.RAZORPAY_WEBHOOK_SECRET).update(raw).digest();const received=Buffer.from(signature,"hex");
  if(received.length!==expected.length||!timingSafeEqual(received,expected))return NextResponse.json({error:"Invalid signature."},{status:401});
  const event=JSON.parse(raw) as RazorpayEvent;const payment=event.payload?.payment?.entity;
  const eventId=request.headers.get("x-razorpay-event-id")||createHash("sha256").update(raw).digest("hex");
  const inserted=await db()<Array<{event_id:string}>>`INSERT INTO webhook_events (provider,event_id,event_type,payload) VALUES ('razorpay',${eventId},${event.event??"unknown"},${db().json(event)}) ON CONFLICT (provider,event_id) DO NOTHING RETURNING event_id`;
  if(!inserted.length)return NextResponse.json({ok:true,duplicate:true});
  try{
    if(event.event==="payment.captured"&&payment?.order_id)await markOrderPaid(payment.order_id,payment.id??null);
    if(event.event==="payment.failed"&&payment?.order_id)await db()`UPDATE orders SET payment_status='failed',updated_at=now() WHERE razorpay_order_id=${payment.order_id} AND payment_status='pending'`;
    await db()`UPDATE webhook_events SET processed_at=now() WHERE provider='razorpay' AND event_id=${eventId}`;
    return NextResponse.json({ok:true});
  }catch(error){
    const message=error instanceof Error?error.message:"Webhook processing failed.";
    await db()`UPDATE webhook_events SET error=${message} WHERE provider='razorpay' AND event_id=${eventId}`;
    return NextResponse.json({error:"Webhook processing failed."},{status:500});
  }
}
