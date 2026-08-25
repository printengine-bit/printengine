import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";
import { requestIsSameOrigin } from "@/lib/security";

export async function POST(request:Request) {
  if(!requestIsSameOrigin(request))return NextResponse.json({error:"Invalid request origin."},{status:403});
  await clearSession();
  return NextResponse.json({ ok: true });
}
