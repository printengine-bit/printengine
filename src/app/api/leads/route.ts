import { NextResponse } from "next/server";

const ALLOWED_TYPES = new Set(["newsletter", "bulk-quote", "support"]);

export async function POST(request: Request) {
  const webhook = process.env.LEADS_WEBHOOK_URL;
  if (!webhook) {
    return NextResponse.json(
      { error: "Online enquiries are not connected yet. Please use the contact page." },
      { status: 503 }
    );
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(String(payload.type))) {
    return NextResponse.json({ error: "Unsupported request type." }, { status: 400 });
  }

  const response = await fetch(webhook, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(process.env.LEADS_WEBHOOK_TOKEN
        ? { authorization: `Bearer ${process.env.LEADS_WEBHOOK_TOKEN}` }
        : {}),
    },
    body: JSON.stringify({ ...payload, source: "printengine", receivedAt: new Date().toISOString() }),
    cache: "no-store",
  });
  if (!response.ok) {
    return NextResponse.json({ error: "We could not send this request. Please try again." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
