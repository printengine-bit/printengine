import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { db, databaseConfigured } from "@/lib/db";
import { markOrderPaid } from "@/lib/order-payment";
import { sendRefundUpdate } from "@/lib/email";

type RazorpayEvent={event?:string;payload?:{payment?:{entity?:{id?:string;order_id?:string}};refund?:{entity?:{id?:string;payment_id?:string;amount?:number;status?:string}}}};

export async function POST(request:Request){
  if(!databaseConfigured()||!process.env.RAZORPAY_WEBHOOK_SECRET)return NextResponse.json({error:"Webhook unavailable."},{status:503});
  const raw=await request.text();const signature=request.headers.get("x-razorpay-signature")??"";
  const expected=createHmac("sha256",process.env.RAZORPAY_WEBHOOK_SECRET).update(raw).digest();const received=Buffer.from(signature,"hex");
  if(received.length!==expected.length||!timingSafeEqual(received,expected))return NextResponse.json({error:"Invalid signature."},{status:401});
  let event:RazorpayEvent;
  try { event=JSON.parse(raw) as RazorpayEvent; if(!event||typeof event!=="object")throw new Error(); }
  catch { return NextResponse.json({error:"Invalid event payload."},{status:400}); }
  const payment=event.payload?.payment?.entity;
  const refund=event.payload?.refund?.entity;
  const eventId=request.headers.get("x-razorpay-event-id")||createHash("sha256").update(raw).digest("hex");
  const inserted=await db()<Array<{event_id:string}>>`INSERT INTO webhook_events (provider,event_id,event_type,payload) VALUES ('razorpay',${eventId},${event.event??"unknown"},${db().json(event)}) ON CONFLICT (provider,event_id) DO NOTHING RETURNING event_id`;
  if(!inserted.length){
    const previous=await db()<Array<{processed_at:Date|null}>>`SELECT processed_at FROM webhook_events WHERE provider='razorpay' AND event_id=${eventId}`;
    // A recorded but failed delivery must remain retryable. The payment handler
    // locks the order and is idempotent, so concurrent redelivery is safe.
    if(previous[0]?.processed_at)return NextResponse.json({ok:true,duplicate:true});
  }
  try{
    if(event.event==="payment.captured"&&payment?.order_id)await markOrderPaid(payment.order_id,payment.id??null);
    if(event.event==="payment.failed"&&payment?.order_id)await db()`UPDATE orders SET payment_status='failed',updated_at=now() WHERE razorpay_order_id=${payment.order_id} AND payment_status='pending'`;
    if(event.event?.startsWith("refund.")&&refund?.id){
      const refundId=refund.id;const refundStatus=refund.status??"pending";const refundAmount=refund.amount??null;
      const result=await db().begin(async sql=>{const rows=await sql<Array<{order_id:string;grand_total:number;email:string;number:string;amount:number}>>`UPDATE refunds r SET status=${refundStatus==="processed"?'processed':refundStatus==="failed"?'failed':'pending'},error=CASE WHEN ${refundStatus==="failed"} THEN 'Razorpay reported a failed refund.' ELSE null END,updated_at=now() FROM orders o WHERE r.order_id=o.id AND r.provider_refund_id=${refundId} RETURNING r.order_id,o.grand_total,o.email,o.number,r.amount`;const row=rows[0];if(row&&refundStatus==="processed"){const totals=await sql<Array<{amount:number}>>`SELECT coalesce(sum(amount),0)::int amount FROM refunds WHERE order_id=${row.order_id} AND status='processed'`;const full=(totals[0]?.amount??0)>=row.grand_total;await sql`UPDATE orders SET payment_status=${full?'refunded':'partially_refunded'},status=CASE WHEN ${full} THEN 'refunded' ELSE status END,updated_at=now() WHERE id=${row.order_id}`;await sql`INSERT INTO order_events(order_id,event,details) VALUES (${row.order_id},${`refund_processed_${refundId}`},${sql.json({refundId,amount:refundAmount})}) ON CONFLICT(order_id,event) DO NOTHING`;}return row??null;});if(result&&refundStatus==="processed")try{await sendRefundUpdate(result.email,result.number,result.amount,refundId);}catch(error){console.error("Refund email failed",error);}
    }
    await db()`UPDATE webhook_events SET processed_at=now(),error=null WHERE provider='razorpay' AND event_id=${eventId}`;
    return NextResponse.json({ok:true});
  }catch(error){
    const message=error instanceof Error?error.message:"Webhook processing failed.";
    await db()`UPDATE webhook_events SET error=${message} WHERE provider='razorpay' AND event_id=${eventId}`;
    return NextResponse.json({error:"Webhook processing failed."},{status:500});
  }
}
