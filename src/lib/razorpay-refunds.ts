import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { sendRefundUpdate } from "@/lib/email";

type RefundResponse={id?:string;status?:"pending"|"processed"|"failed";error?:{description?:string}};

function credentials(){const key=process.env.RAZORPAY_KEY_ID;const secret=process.env.RAZORPAY_KEY_SECRET;if(!key||!secret)throw new Error("Razorpay refund credentials are not configured.");return Buffer.from(`${key}:${secret}`).toString("base64");}

export async function createOrderRefund(orderId:string,amount:number,reason:string,actorId:string){
  const request=await db().begin(async sql=>{
    const orders=await sql<Array<{id:string;number:string;email:string;grand_total:number;payment_status:string;razorpay_payment_id:string|null}>>`SELECT id,number,email,grand_total,payment_status,razorpay_payment_id FROM orders WHERE id=${orderId} FOR UPDATE`;
    const order=orders[0];if(!order)throw new Error("Order not found.");if(order.number.startsWith("DEMO-"))throw new Error("Demo preview orders cannot trigger real refunds.");if(!["paid","partially_refunded"].includes(order.payment_status)||!order.razorpay_payment_id)throw new Error("Only captured Razorpay payments can be refunded.");
    const totals=await sql<Array<{amount:number}>>`SELECT coalesce(sum(amount),0)::int amount FROM refunds WHERE order_id=${orderId} AND status IN ('queued','pending','processed')`;
    if(amount<1||amount>order.grand_total-(totals[0]?.amount??0))throw new Error("Refund amount exceeds the remaining captured amount.");
    const idempotencyKey=randomUUID();const receipt=`${order.number}-${idempotencyKey.slice(0,8)}`;
    const rows=await sql<Array<{id:string}>>`INSERT INTO refunds(order_id,idempotency_key,amount,reason,actor_id) VALUES (${orderId},${idempotencyKey},${amount},${reason},${actorId}) RETURNING id`;
    return {id:rows[0].id,order,idempotencyKey,receipt};
  });
  try{
    const response=await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(request.order.razorpay_payment_id!)}/refund`,{method:"POST",headers:{authorization:`Basic ${credentials()}`,"content-type":"application/json","X-Refund-Idempotency":request.idempotencyKey},body:JSON.stringify({amount:amount*100,speed:"normal",receipt:request.receipt,notes:{order_number:request.order.number,reason:reason.slice(0,256)}}),cache:"no-store"});
    const payload=await response.json().catch(()=>({})) as RefundResponse;if(!response.ok||!payload.id)throw new Error(payload.error?.description||`Razorpay returned HTTP ${response.status}.`);
    const status=payload.status==="processed"?"processed":"pending";const providerRefundId=payload.id;
    await db().begin(async sql=>{await sql`UPDATE refunds SET provider_refund_id=${providerRefundId},status=${status},error=null,updated_at=now() WHERE id=${request.id}`;if(status==="processed"){const total=await sql<Array<{amount:number}>>`SELECT coalesce(sum(amount),0)::int amount FROM refunds WHERE order_id=${orderId} AND status='processed'`;const full=(total[0]?.amount??0)>=request.order.grand_total;await sql`UPDATE orders SET payment_status=${full?'refunded':'partially_refunded'},status=CASE WHEN ${full} THEN 'refunded' ELSE status END,updated_at=now() WHERE id=${orderId}`;}await sql`INSERT INTO order_events(order_id,event,details) VALUES (${orderId},${`refund_${status}_${providerRefundId}`},${sql.json({refundId:providerRefundId,amount,reason})}) ON CONFLICT(order_id,event) DO NOTHING`;return null;});
    if(status==="processed")try{await sendRefundUpdate(request.order.email,request.order.number,amount,providerRefundId);}catch(error){console.error("Refund email failed",error);}return {id:providerRefundId,status};
  }catch(error){const message=error instanceof Error?error.message:"Refund request failed.";await db()`UPDATE refunds SET status='failed',error=${message},updated_at=now() WHERE id=${request.id}`;throw error;}
}
