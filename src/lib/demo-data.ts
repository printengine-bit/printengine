import { randomUUID } from "node:crypto";
import { passwordHash } from "@/lib/auth";
import { db } from "@/lib/db";

const DEMO_EMAIL_SUFFIX = "@demo.printengine.invalid";
const DEMO_ORDER_PREFIX = "DEMO-";
const DEMO_REFERENCE = "DEMO-PREVIEW";

const customers = [
  ["Aarav Mehta", "aarav", "Mumbai", "Maharashtra", "400001"],
  ["Diya Sharma", "diya", "New Delhi", "Delhi", "110001"],
  ["Kabir Iyer", "kabir", "Bengaluru", "Karnataka", "560001"],
  ["Meera Nair", "meera", "Kochi", "Kerala", "682001"],
  ["Rohan Das", "rohan", "Kolkata", "West Bengal", "700001"],
  ["Ananya Patel", "ananya", "Ahmedabad", "Gujarat", "380001"],
  ["Vivaan Singh", "vivaan", "Jaipur", "Rajasthan", "302001"],
  ["Ishita Rao", "ishita", "Hyderabad", "Telangana", "500001"],
  ["Arjun Verma", "arjun", "Lucknow", "Uttar Pradesh", "226001"],
  ["Sara Khan", "sara", "Pune", "Maharashtra", "411001"],
  ["Neel Joshi", "neel", "Surat", "Gujarat", "395003"],
  ["Tara Bose", "tara", "Chennai", "Tamil Nadu", "600001"],
] as const;

const orderStates = [
  ["delivered", "paid", "fulfilled"],
  ["delivered", "paid", "fulfilled"],
  ["shipped", "paid", "fulfilled"],
  ["in_production", "paid", "processing"],
  ["confirmed", "paid", "unfulfilled"],
  ["pending", "pending", "unfulfilled"],
  ["pending", "failed", "unfulfilled"],
  ["cancelled", "failed", "unfulfilled"],
  ["refunded", "refunded", "returned"],
] as const;

type DemoCounts = { customers: number; orders: number; artworks: number };
type Variant = { id: string; product_id: string; product_name: string; sku: string; colour: string; size: string; price: number };

export async function clearDemoData(): Promise<void> {
  await db().begin(async (sql) => {
    await sql`DELETE FROM refunds WHERE order_id IN (SELECT id FROM orders WHERE number LIKE ${`${DEMO_ORDER_PREFIX}%`})`;
    await sql`DELETE FROM orders WHERE number LIKE ${`${DEMO_ORDER_PREFIX}%`}`;
    await sql`DELETE FROM inventory_movements WHERE reference=${DEMO_REFERENCE}`;
    await sql`DELETE FROM users WHERE email LIKE ${`%${DEMO_EMAIL_SUFFIX}`}`;
    await sql`DELETE FROM discounts WHERE code='DEMO-PREVIEW-ONLY'`;
  });
}

export async function loadDemoData(adminId: string): Promise<DemoCounts> {
  const disabledPassword = await passwordHash(randomUUID());
  return db().begin(async (sql) => {
    await sql`DELETE FROM refunds WHERE order_id IN (SELECT id FROM orders WHERE number LIKE ${`${DEMO_ORDER_PREFIX}%`})`;
    await sql`DELETE FROM orders WHERE number LIKE ${`${DEMO_ORDER_PREFIX}%`}`;
    await sql`DELETE FROM inventory_movements WHERE reference=${DEMO_REFERENCE}`;
    await sql`DELETE FROM users WHERE email LIKE ${`%${DEMO_EMAIL_SUFFIX}`}`;
    await sql`DELETE FROM discounts WHERE code='DEMO-PREVIEW-ONLY'`;

    const discountRows = await sql<Array<{ id: string }>>`
      INSERT INTO discounts (name,code,type,value,minimum_subtotal,usage_limit,used_count,active,combinable,starts_at,ends_at)
      VALUES ('Demo preview — 15% off','DEMO-PREVIEW-ONLY','percentage',15,999,100,14,false,false,now()-interval '14 days',now()+interval '30 days')
      RETURNING id
    `;
    const discountId = discountRows[0].id;
    const variants = await sql<Variant[]>`
      SELECT id,product_id,product_name,sku,colour,size,price FROM (
        SELECT DISTINCT ON (p.id) v.id,p.id product_id,p.name product_name,v.sku,v.colour,v.size,coalesce(v.price,p.base_price)::int price
        FROM products p JOIN product_variants v ON v.product_id=p.id
        WHERE p.status='active' AND v.active=true
        ORDER BY p.id,v.created_at
      ) chosen ORDER BY product_name LIMIT 20
    `;
    if (!variants.length) throw new Error("The catalogue needs at least one active variant before demo data can be loaded.");

    const customerIds: string[] = [];
    for (let index = 0; index < customers.length; index += 1) {
      const [name, handle, city, state, postalCode] = customers[index];
      const email = `${handle}${DEMO_EMAIL_SUFFIX}`;
      const phone = `900000${String(index + 1).padStart(4, "0")}`;
      const createdAt = new Date(Date.now() - (55 - index * 3) * 86_400_000);
      const rows = await sql<Array<{ id: string }>>`
        INSERT INTO users (email,phone,name,password_hash,role,active,email_verified_at,last_login_at,created_at,updated_at)
        VALUES (${email},${phone},${name},${disabledPassword},'customer',true,${createdAt},${new Date(createdAt.getTime() + 5 * 86_400_000)},${createdAt},now())
        RETURNING id
      `;
      const customerId = rows[0].id;
      customerIds.push(customerId);
      await sql`
        INSERT INTO addresses (user_id,label,recipient,phone,line1,line2,city,state,postal_code,is_default,created_at)
        VALUES (${customerId},'Home',${name},${phone},${`${24 + index}, Demo Preview Road`},'Sample address — not for delivery',${city},${state},${postalCode},true,${createdAt})
      `;
      if (index % 3 === 0) await sql`
        INSERT INTO customer_notes (customer_id,note,actor_id,created_at)
        VALUES (${customerId},'Demo support note: customer prefers WhatsApp updates for customised orders.',${adminId},${new Date(createdAt.getTime() + 8 * 86_400_000)})
      `;
    }

    const artworkUrls = ["/artwork/showcase/porsche-911.png", "/artwork/showcase/bengal-tiger.png", "/artwork/showcase/astronaut.png", "/artwork/showcase/koi-peonies.png"];
    const artworkStatuses = ["pending", "approved", "changes_requested", "rejected"] as const;
    for (let index = 0; index < 8; index += 1) {
      const status = artworkStatuses[index % artworkStatuses.length];
      await sql`
        INSERT INTO artworks (user_id,source,name,url,metadata,status,reviewed_by,reviewed_at,review_notes,assigned_to,created_at)
        VALUES (${customerIds[index]},${index % 2 ? "upload" : "ai"},${`Demo artwork ${index + 1}`},${artworkUrls[index % artworkUrls.length]},${sql.json({ demo: true, printArea: index % 3 === 0 ? "back" : "front" })},${status},${status === "pending" ? null : adminId},${status === "pending" ? null : new Date()},${status === "changes_requested" ? "Increase line weight before production." : status === "approved" ? "Print-ready demo file." : null},${index < 5 ? adminId : null},${new Date(Date.now() - (index + 1) * 86_400_000)})
      `;
    }

    let createdOrders = 0;
    for (let index = 0; index < 24; index += 1) {
      const customerIndex = index % customerIds.length;
      const [name, handle, city, state, postalCode] = customers[customerIndex];
      const variant = variants[index % variants.length];
      const quantity = index % 5 === 0 ? 2 : 1;
      const decorationPrice = index % 3 === 0 ? 249 : 149;
      const subtotal = variant.price * quantity;
      const decorationTotal = decorationPrice * quantity;
      const discountTotal = index % 4 === 0 ? Math.round(subtotal * 0.1) : 0;
      const shippingTotal = subtotal >= 999 ? 0 : 79;
      const grandTotal = subtotal + decorationTotal - discountTotal + shippingTotal;
      const [status, paymentStatus, fulfillmentStatus] = orderStates[index % orderStates.length];
      const createdAt = new Date(Date.now() - (index + 1) * 86_400_000);
      const number = `${DEMO_ORDER_PREFIX}2026-${String(index + 1).padStart(4, "0")}`;
      const phone = `900000${String(customerIndex + 1).padStart(4, "0")}`;
      const address = { recipient: name, phone, line1: `${24 + customerIndex}, Demo Preview Road`, line2: "Sample address — not for delivery", city, state, postalCode };
      const inTransit=["shipped", "delivered"].includes(status);
      const orderRows = await sql<Array<{ id: string }>>`
        INSERT INTO orders (number,customer_id,email,phone,shipping_address,subtotal,decoration_total,discount_total,shipping_total,grand_total,discount_id,discount_code,status,payment_status,fulfillment_status,shipment_provider,courier_name,shipment_status,tracking_number,notes,reservation_released,created_at,updated_at,shipped_at,delivered_at)
        VALUES (${number},${customerIds[customerIndex]},${`${handle}${DEMO_EMAIL_SUFFIX}`},${phone},${sql.json(address)},${subtotal},${decorationTotal},${discountTotal},${shippingTotal},${grandTotal},${index % 4 === 0 ? discountId : null},${index % 4 === 0 ? "DEMO-PREVIEW-ONLY" : null},${status},${paymentStatus},${fulfillmentStatus},${inTransit ? "demo" : null},${inTransit ? "Demo Express" : null},${status === "delivered" ? "Delivered" : status === "shipped" ? "In transit" : null},${inTransit ? `DEMOAWB${10000 + index}` : null},'[DEMO DATA — preview only. Do not fulfil, refund, contact, or ship.]',true,${createdAt},${createdAt},${inTransit ? new Date(createdAt.getTime() + 2 * 86_400_000) : null},${status === "delivered" ? new Date(createdAt.getTime() + 5 * 86_400_000) : null})
        RETURNING id
      `;
      const orderId = orderRows[0].id;
      await sql`
        INSERT INTO order_items (order_id,product_id,variant_id,product_name,sku,colour,size,method,quantity,unit_price,decoration_price,designs,artwork_status,created_at)
        VALUES (${orderId},${variant.product_id},${variant.id},${variant.product_name},${variant.sku},${variant.colour},${variant.size},${index % 2 ? "Custom print" : "Embroidery"},${quantity},${variant.price},${decorationPrice},${sql.json([{ area: index % 3 === 0 ? "back" : "front", artworkUrl: artworkUrls[index % artworkUrls.length] }])},${status === "pending" ? "pending" : "approved"},${createdAt})
      `;
      await sql`INSERT INTO order_events (order_id,event,details,created_at) VALUES (${orderId},'demo_order_created',${sql.json({ demo: true, source: "production-preview" })},${createdAt})`;
      if (paymentStatus === "paid") await sql`INSERT INTO order_events (order_id,event,details,created_at) VALUES (${orderId},'demo_payment_captured',${sql.json({ demo: true, amount: grandTotal })},${new Date(createdAt.getTime() + 3_600_000)})`;
      if (inTransit) await sql`INSERT INTO order_events (order_id,event,details,created_at) VALUES (${orderId},'demo_shipment_dispatched',${sql.json({ demo: true, courier: "Demo Express" })},${new Date(createdAt.getTime() + 2 * 86_400_000)})`;
      if (status === "refunded") await sql`
        INSERT INTO refunds (order_id,provider,provider_refund_id,idempotency_key,amount,reason,status,actor_id,created_at,updated_at)
        VALUES (${orderId},'demo',${`demo_refund_${index}`},${`demo-idempotency-${index}`},${grandTotal},'Demo return preview','processed',${adminId},${new Date(createdAt.getTime() + 4 * 86_400_000)},now())
      `;
      createdOrders += 1;
    }

    for (let index = 0; index < Math.min(8, variants.length); index += 1) await sql`
      INSERT INTO inventory_movements (variant_id,quantity,reason,reference,actor_id,created_at)
      VALUES (${variants[index].id},${index % 2 === 0 ? 12 : -3},'demo stock preview',${DEMO_REFERENCE},${adminId},${new Date(Date.now() - (index + 2) * 86_400_000)})
    `;
    return { customers: customerIds.length, orders: createdOrders, artworks: 8 };
  });
}
