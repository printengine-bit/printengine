import { NextResponse } from "next/server";
import { Resend } from "resend";
import { db, databaseConfigured } from "@/lib/db";

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
  if (!databaseConfigured() || !apiKey || !webhookSecret) return NextResponse.json({ error: "Webhook unavailable." }, { status: 503 });
  const id = request.headers.get("svix-id");
  const timestamp = request.headers.get("svix-timestamp");
  const signature = request.headers.get("svix-signature");
  if (!id || !timestamp || !signature) return NextResponse.json({ error: "Signature headers missing." }, { status: 400 });
  const raw = await request.text();
  try {
    const event = new Resend(apiKey).webhooks.verify({
      payload: raw,
      headers: { id, timestamp, signature },
      webhookSecret,
    });
    const storedEvent = JSON.parse(JSON.stringify(event)) as never;
    await db()`
      INSERT INTO webhook_events(provider,event_id,event_type,payload,processed_at)
      VALUES ('resend',${id},${event.type},${db().json(storedEvent)},now())
      ON CONFLICT(provider,event_id) DO NOTHING
    `;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  }
}

