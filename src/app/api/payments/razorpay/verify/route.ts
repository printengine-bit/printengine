import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { databaseConfigured } from "@/lib/db";
import { markOrderPaid } from "@/lib/order-payment";
import { rateLimit, requestIsSameOrigin, tooManyRequests } from "@/lib/security";
const schema=z.object({orderId:z.string().uuid(),razorpayOrderId:z.string(),razorpayPaymentId:z.string(),signature:z.string()});
export async function POST(request:Request){
  if(!databaseConfigured()||!process.env.RAZORPAY_KEY_SECRET)return NextResponse.json({error:"Payment verification is not configured."},{status:503});
  if(!requestIsSameOrigin(request))return NextResponse.json({error:"Invalid request origin."},{status:403});
  const limited=await rateLimit(request,"payment-verify",20,600);if(!limited.allowed)return tooManyRequests(limited.retryAfter);
  const parsed=schema.safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:"Invalid payment response."},{status:400});
  const expected=createHmac("sha256",process.env.RAZORPAY_KEY_SECRET).update(`${parsed.data.razorpayOrderId}|${parsed.data.razorpayPaymentId}`).digest();
  const received=Buffer.from(parsed.data.signature,"hex");
  if(received.length!==expected.length||!timingSafeEqual(received,expected))return NextResponse.json({error:"Payment signature could not be verified."},{status:400});
  const result=await markOrderPaid(parsed.data.razorpayOrderId,parsed.data.razorpayPaymentId,parsed.data.orderId);
  if(!result)return NextResponse.json({error:"Order not found."},{status:404});
  return NextResponse.json({ok:true,orderNumber:result.number});
}
