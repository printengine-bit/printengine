import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { db, databaseConfigured } from "@/lib/db";
import { sendShipmentUpdate } from "@/lib/email";
import { normalizedShipmentState, type ShiprocketWebhook } from "@/lib/shiprocket";

function tokenMatches(received: string, expected: string) {
  const left = Buffer.from(received);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function POST(request: Request) {
  const secret = process.env.SHIPROCKET_WEBHOOK_TOKEN;
  if (!databaseConfigured() || !secret) return NextResponse.json({ error: "Webhook unavailable." }, { status: 503 });
  const supplied = request.headers.get("x-api-key") || "";
  if (!tokenMatches(supplied, secret)) return NextResponse.json({ error: "Invalid webhook token." }, { status: 401 });
  const raw = await request.text();
  let payload: ShiprocketWebhook;
  try { payload = JSON.parse(raw) as ShiprocketWebhook; }
  catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }
  const awb = payload.awb ? String(payload.awb) : null;
  const externalOrderId = payload.order_id ? String(payload.order_id) : null;
  if (!awb && !externalOrderId) return NextResponse.json({ error: "Shipment reference missing." }, { status: 400 });
  const eventId = createHash("sha256").update(raw).digest("hex");
  const storedPayload = JSON.parse(JSON.stringify(payload)) as never;
  const inserted = await db()<Array<{ event_id: string }>>`
    INSERT INTO webhook_events(provider,event_id,event_type,payload)
    VALUES ('shiprocket',${eventId},${payload.current_status || payload.shipment_status || "unknown"},${db().json(storedPayload)})
    ON CONFLICT(provider,event_id) DO NOTHING RETURNING event_id
  `;
  if (!inserted.length) return NextResponse.json({ ok: true, duplicate: true });
  try {
    const orders = await db()<Array<{ id:string;number:string;email:string;status:string }>>`
      SELECT id,number,email,status FROM orders
      WHERE (${awb}::text IS NOT NULL AND tracking_number=${awb}) OR (${externalOrderId}::text IS NOT NULL AND number=${externalOrderId})
      LIMIT 1
    `;
    const order = orders[0];
    if (!order) throw new Error("No PrintEngine order matches this shipment.");
    const rawStatus = payload.current_status || payload.shipment_status || "Tracking updated";
    const state = normalizedShipmentState(rawStatus);
    const trackingUrl = awb ? `https://app.shiprocket.in/tracking/awb/${encodeURIComponent(awb)}` : null;
    const nextStatus = state === "delivered" ? "delivered" : state === "cancelled" ? "cancelled" : state === "shipped" ? "shipped" : order.status;
    const fulfillment = state === "delivered" ? "fulfilled" : state === "returned" ? "returned" : state === "cancelled" ? "unfulfilled" : "processing";
    await db()`UPDATE orders SET
      status=${nextStatus},fulfillment_status=${fulfillment},shipment_status=${rawStatus},
      tracking_number=coalesce(${awb},tracking_number),courier_name=coalesce(${payload.courier_name || null},courier_name),
      tracking_url=coalesce(${trackingUrl},tracking_url),shipped_at=CASE WHEN ${state === "shipped"} THEN coalesce(shipped_at,now()) ELSE shipped_at END,
      delivered_at=CASE WHEN ${state === "delivered"} THEN coalesce(delivered_at,now()) ELSE delivered_at END,updated_at=now()
      WHERE id=${order.id}`;
    const eventName = `shipment_${state}`;
    const eventDetails = JSON.parse(JSON.stringify({status:rawStatus,awb,courier:payload.courier_name,etd:payload.etd,scans:payload.scans || []})) as never;
    const event = await db()<Array<{ id:string }>>`
      INSERT INTO order_events(order_id,event,details) VALUES (${order.id},${eventName},${db().json(eventDetails)})
      ON CONFLICT(order_id,event) DO NOTHING RETURNING id
    `;
    if (event.length && ["shipped","delivered","returned","cancelled"].includes(state)) {
      await sendShipmentUpdate(order.email, order.number, rawStatus, trackingUrl);
    }
    await db()`UPDATE webhook_events SET processed_at=now() WHERE provider='shiprocket' AND event_id=${eventId}`;
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook processing failed.";
    await db()`UPDATE webhook_events SET error=${message} WHERE provider='shiprocket' AND event_id=${eventId}`;
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
