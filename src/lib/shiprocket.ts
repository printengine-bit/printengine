import { db } from "@/lib/db";

const API_BASE = "https://apiv2.shiprocket.in/v1/external";

let cachedToken: { value: string; expiresAt: number } | null = null;

type ShippingAddress = {
  name?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
};

type ShipmentOrder = {
  id: string;
  number: string;
  email: string;
  phone: string;
  shipping_address: ShippingAddress;
  grand_total: number;
  shipping_total: number;
  discount_total: number;
  payment_status: string;
  shipment_id: string | null;
  tracking_number: string | null;
  courier_name: string | null;
  shipping_label_url: string | null;
  created_at: Date;
};

type ShipmentItem = {
  product_name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  decoration_price: number;
};

type ShiprocketResponse = Record<string, unknown>;

function positiveEnv(name: string) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : null;
}

export function shiprocketConfigured() {
  return Boolean(
    process.env.SHIPROCKET_EMAIL &&
    process.env.SHIPROCKET_PASSWORD &&
    process.env.SHIPROCKET_PICKUP_LOCATION &&
    process.env.SHIPROCKET_WEBHOOK_TOKEN &&
    positiveEnv("SHIPROCKET_PACKAGE_LENGTH_CM") &&
    positiveEnv("SHIPROCKET_PACKAGE_BREADTH_CM") &&
    positiveEnv("SHIPROCKET_PACKAGE_HEIGHT_CM") &&
    positiveEnv("SHIPROCKET_ITEM_WEIGHT_KG"),
  );
}

function requiredConfig() {
  if (!shiprocketConfigured()) {
    throw new Error("Shiprocket needs API credentials, pickup location, webhook token and package dimensions/weight before shipments can be booked.");
  }
  return {
    pickupLocation: process.env.SHIPROCKET_PICKUP_LOCATION!,
    length: positiveEnv("SHIPROCKET_PACKAGE_LENGTH_CM")!,
    breadth: positiveEnv("SHIPROCKET_PACKAGE_BREADTH_CM")!,
    height: positiveEnv("SHIPROCKET_PACKAGE_HEIGHT_CM")!,
    itemWeight: positiveEnv("SHIPROCKET_ITEM_WEIGHT_KG")!,
  };
}

async function responseError(response: Response) {
  const body = await response.text();
  try {
    const json = JSON.parse(body) as { message?: string; errors?: Record<string, string[]> };
    const fields = json.errors ? Object.values(json.errors).flat().join(" ") : "";
    return json.message || fields || `Shiprocket returned HTTP ${response.status}.`;
  } catch {
    return body.slice(0, 300) || `Shiprocket returned HTTP ${response.status}.`;
  }
}

async function authToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.value;
  if (!process.env.SHIPROCKET_EMAIL || !process.env.SHIPROCKET_PASSWORD) throw new Error("Shiprocket API credentials are missing.");
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: process.env.SHIPROCKET_EMAIL, password: process.env.SHIPROCKET_PASSWORD }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(await responseError(response));
  const payload = await response.json() as { token?: string };
  if (!payload.token) throw new Error("Shiprocket authentication did not return a token.");
  cachedToken = { value: payload.token, expiresAt: Date.now() + 9 * 24 * 60 * 60 * 1000 };
  return payload.token;
}

async function api(path: string, init: RequestInit = {}) {
  const token = await authToken();
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      ...init.headers,
    },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(await responseError(response));
  return response.json() as Promise<ShiprocketResponse>;
}

function customerNames(name = "Customer") {
  const parts = name.trim().split(/\s+/);
  return { firstName: parts.shift() || "Customer", lastName: parts.join(" ") || "." };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

function stringValue(...values: unknown[]) {
  const value = values.find((candidate) => typeof candidate === "string" || typeof candidate === "number");
  return value === undefined ? null : String(value);
}

export async function bookOrderShipment(orderId: string) {
  const config = requiredConfig();
  const orders = await db()<ShipmentOrder[]>`
    SELECT id,number,email,phone,shipping_address,grand_total,shipping_total,discount_total,payment_status,
      shipment_id,tracking_number,courier_name,shipping_label_url,created_at
    FROM orders WHERE id=${orderId} LIMIT 1
  `;
  const order = orders[0];
  if (!order) throw new Error("Order not found.");
  if (order.payment_status !== "paid") throw new Error("Only paid orders can be booked for shipping.");
  const items = await db()<ShipmentItem[]>`
    SELECT product_name,sku,quantity,unit_price,decoration_price FROM order_items WHERE order_id=${order.id} ORDER BY created_at
  `;
  if (!items.length) throw new Error("The order has no shippable items.");
  const address = order.shipping_address;
  if (!address.line1 || !address.city || !address.state || !address.postalCode) throw new Error("The delivery address is incomplete.");
  const names = customerNames(address.name);
  const units = items.reduce((sum, item) => sum + item.quantity, 0);
  let shipmentId = order.shipment_id;
  let awb = order.tracking_number;
  let courierName = order.courier_name;
  let labelUrl = order.shipping_label_url;

  try {
    if (!shipmentId) {
      const created = await api("/orders/create/adhoc", {
        method: "POST",
        body: JSON.stringify({
          order_id: order.number,
          order_date: order.created_at.toISOString().slice(0, 19).replace("T", " "),
          pickup_location: config.pickupLocation,
          billing_customer_name: names.firstName,
          billing_last_name: names.lastName,
          billing_address: address.line1,
          billing_address_2: address.line2 || "",
          billing_city: address.city,
          billing_pincode: address.postalCode,
          billing_state: address.state,
          billing_country: "India",
          billing_email: order.email,
          billing_phone: order.phone,
          shipping_is_billing: true,
          order_items: items.map((item) => ({
            name: item.product_name,
            sku: item.sku,
            units: item.quantity,
            selling_price: item.unit_price + item.decoration_price,
            discount: 0,
            tax: 0,
          })),
          payment_method: "Prepaid",
          shipping_charges: order.shipping_total,
          total_discount: order.discount_total,
          sub_total: Math.max(0, order.grand_total - order.shipping_total),
          length: config.length,
          breadth: config.breadth,
          height: config.height,
          weight: Number((units * config.itemWeight).toFixed(3)),
        }),
      });
      shipmentId = stringValue(created.shipment_id);
      if (!shipmentId) throw new Error("Shiprocket created the order without a shipment ID.");
      await db()`UPDATE orders SET shipment_provider='shiprocket',shipment_id=${shipmentId},shipment_status='ORDER CREATED',shipment_error=null,fulfillment_status='processing',updated_at=now() WHERE id=${order.id}`;
    }

    if (!awb) {
      const assigned = await api("/courier/assign/awb", { method: "POST", body: JSON.stringify({ shipment_id: Number(shipmentId) }) });
      const data = asRecord(asRecord(assigned.response).data);
      awb = stringValue(data.awb_code, assigned.awb_code);
      courierName = stringValue(data.courier_name, assigned.courier_name);
      if (!awb) throw new Error(stringValue(asRecord(assigned.response).message, assigned.message) || "Shiprocket could not assign an AWB.");
      await db()`UPDATE orders SET tracking_number=${awb},courier_name=${courierName},shipment_status='AWB ASSIGNED',updated_at=now() WHERE id=${order.id}`;
    }

    await api("/courier/generate/pickup", { method: "POST", body: JSON.stringify({ shipment_id: [Number(shipmentId)] }) });

    if (!labelUrl) {
      const label = await api("/courier/generate/label", { method: "POST", body: JSON.stringify({ shipment_id: [Number(shipmentId)] }) });
      labelUrl = stringValue(label.label_url, asRecord(label.response).label_url);
    }
    let trackingUrl = `https://app.shiprocket.in/tracking/awb/${encodeURIComponent(awb)}`;
    try {
      const tracking = await api(`/courier/track/awb/${encodeURIComponent(awb)}`);
      const trackingData = asRecord(tracking.tracking_data);
      trackingUrl = stringValue(trackingData.track_url) || trackingUrl;
    } catch {
      // An AWB can take a short time to become visible to the tracking API.
    }
    await db()`UPDATE orders SET shipment_status='PICKUP SCHEDULED',tracking_url=${trackingUrl},shipping_label_url=${labelUrl},shipment_error=null,updated_at=now() WHERE id=${order.id}`;
    await db()`INSERT INTO order_events(order_id,event,details) VALUES (${order.id},'shipment_booked',${db().json({shipmentId,awb,courierName,labelUrl})}) ON CONFLICT(order_id,event) DO NOTHING`;
    return { shipmentId, awb, courierName, labelUrl, trackingUrl };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Shipment booking failed.";
    await db()`UPDATE orders SET shipment_error=${message},updated_at=now() WHERE id=${order.id}`;
    throw error;
  }
}

export type ShiprocketWebhook = {
  awb?: string | number;
  courier_name?: string;
  current_status?: string;
  current_status_id?: number;
  shipment_status?: string;
  shipment_status_id?: number;
  order_id?: string | number;
  sr_order_id?: string | number;
  etd?: string;
  scans?: unknown[];
};

export function normalizedShipmentState(value?: string) {
  const status = (value || "UNKNOWN").trim().toUpperCase();
  if (status.includes("DELIVERED") && !status.includes("RTO")) return "delivered" as const;
  if (status.includes("RTO") || status.includes("RETURN")) return "returned" as const;
  if (status.includes("CANCEL")) return "cancelled" as const;
  if (status.includes("PICKED") || status.includes("IN TRANSIT") || status.includes("OUT FOR DELIVERY") || status.includes("OFD")) return "shipped" as const;
  return "processing" as const;
}
