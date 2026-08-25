import { NextResponse } from "next/server";
import { cloudinaryConfigured } from "@/lib/cloudinary";
import { databaseConfigured, db } from "@/lib/db";
import { emailConfigured } from "@/lib/email";

export const dynamic="force-dynamic";

export async function GET(request:Request){
  let database=false;
  if(databaseConfigured()){try{await db()`SELECT 1`;database=true;}catch{database=false;}}
  const checks={
    database,
    sessions:Boolean(process.env.SESSION_SECRET&&process.env.SESSION_SECRET.length>=32),
    payments:Boolean(process.env.RAZORPAY_KEY_ID&&process.env.RAZORPAY_KEY_SECRET&&process.env.RAZORPAY_WEBHOOK_SECRET),
    artwork:Boolean(process.env.OPENAI_API_KEY)&&cloudinaryConfigured(),
    email:emailConfigured(),
    fulfilment:Boolean(process.env.SHIPROCKET_EMAIL&&process.env.SHIPROCKET_PASSWORD),
  };
  const ready=checks.database&&checks.sessions&&checks.payments&&checks.artwork&&checks.email;
  const readiness=new URL(request.url).searchParams.get("readiness")==="1";
  return NextResponse.json({ok:true,ready,checks},{status:readiness&&!ready?503:200,headers:{"cache-control":"no-store"}});
}
