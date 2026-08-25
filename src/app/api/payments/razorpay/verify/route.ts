import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { databaseConfigured } from "@/lib/db";
import { markOrderPaid } from "@/lib/order-payment";
const schema=z.object({orderId:z.string().uuid(),razorpayOrderId:z.string(),razorpayPaymentId:z.string(),signature:z.string()});
export async function POST(request:Request){
  if(!databaseConfigured()||!process.env.RAZORPAY_KEY_SECRET)return NextResponse.json({error:"Payment verification is not configured."},{status:503});
  const parsed=schema.safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:"Invalid payment response."},{status:400});
  const expected=createHmac("sha256",process.env.RAZORPAY_KEY_SECRET).update(`${parsed.data.razorpayOrderId}|${parsed.data.razorpayPaymentId}`).digest();
  const received=Buffer.from(parsed.data.signature,"hex");
  if(received.length!==expected.length||!timingSafeEqual(received,expected))return NextResponse.json({error:"Payment signature could not be verified."},{status:400});
  const orderNumber=await markOrderPaid(parsed.data.razorpayOrderId,parsed.data.razorpayPaymentId);
  if(!orderNumber)return NextResponse.json({error:"Order not found."},{status:404});
  return NextResponse.json({ok:true,orderNumber});
}
