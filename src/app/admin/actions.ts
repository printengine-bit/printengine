"use server";

import { runAdminAction } from "@/lib/admin-mutation";
import { AdminInputError, orderUpdateError } from "@/lib/admin-validation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { bookOrderShipment } from "@/lib/shiprocket";

async function actor() {
  const user = await requireAdmin();
  if (!user) throw new Error("Administrator access required.");
  return user;
}

async function audit(actorId: string, action: string, entityType: string, entityId?: string) {
  await db()`INSERT INTO audit_logs (actor_id, action, entity_type, entity_id) VALUES (${actorId}, ${action}, ${entityType}, ${entityId ?? null})`;
}

export async function createProduct(form:FormData){
  return runAdminAction("createProduct", form, async () => {
  const user=await actor();const name=String(form.get("name")||"").trim();const slug=String(form.get("slug")||"").trim().toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  if(!name||!slug)throw new Error("Product name and slug are required.");
  const price=Math.max(0,Number(form.get("price"))||0);const mrp=Math.max(price,Number(form.get("mrp"))||price);const colour=String(form.get("colour")||"Black");const size=String(form.get("size")||"M");const stock=Math.max(0,Number(form.get("stock"))||0);const sku=`PE-${slug}-${colour}-${size}`.toUpperCase().replace(/[^A-Z0-9]+/g,"-");
  const productId=await db().begin(async sql=>{const rows=await sql<Array<{id:string}>>`INSERT INTO products (slug,name,subtitle,category,kind,fit,gsm,base_price,compare_at_price,audience,methods,status) VALUES (${slug},${name},${String(form.get("subtitle")||"")},${String(form.get("category")||"t-shirts")},${String(form.get("kind")||"tee-half")},${String(form.get("fit")||"Regular")},${Math.max(0,Number(form.get("gsm"))||0)},${price},${mrp},${sql.json(["Men","Women"])},${sql.json(["Custom print"])},'draft') RETURNING id`;await sql`INSERT INTO product_variants(product_id,sku,colour,colour_hex,size,stock) VALUES (${rows[0].id},${sku},${colour},${String(form.get("colourHex")||"#0a0a0a")},${size},${stock})`;return rows[0].id;});
  await audit(user.id,"product.created","product",productId);revalidatePath("/admin/products");
  });
}

export async function createVariant(form:FormData){
  return runAdminAction("createVariant", form, async () => {const user=await actor();const productId=String(form.get("productId"));const product=await db()<Array<{slug:string}>>`SELECT slug FROM products WHERE id=${productId}`;if(!product[0])throw new Error("Product not found.");const colour=String(form.get("colour"));const size=String(form.get("size"));const sku=`PE-${product[0].slug}-${colour}-${size}`.toUpperCase().replace(/[^A-Z0-9]+/g,"-");await db()`INSERT INTO product_variants(product_id,sku,colour,colour_hex,size,stock) VALUES (${productId},${sku},${colour},${String(form.get("colourHex")||"#0a0a0a")},${size},${Math.max(0,Number(form.get("stock"))||0)})`;await audit(user.id,"variant.created","variant");revalidatePath("/admin/inventory");  });
}

export async function updateProduct(form: FormData) {
  return runAdminAction("updateProduct", form, async () => {
  const user = await actor();
  const id = String(form.get("id"));
  const price = Math.max(0, Number(form.get("price")) || 0);
  const compareAt = Math.max(price, Number(form.get("compareAt")) || price);
  const status = String(form.get("status"));
  if (!["draft", "active", "archived"].includes(status)) throw new Error("Invalid product status.");
  await db()`UPDATE products SET base_price=${price}, compare_at_price=${compareAt}, status=${status}, updated_at=now() WHERE id=${id}`;
  await audit(user.id, "product.updated", "product", id);
  revalidatePath("/admin/products");
  });
}

export async function updateInventory(form: FormData) {
  return runAdminAction("updateInventory", form, async () => {
  const user = await actor();
  const id = String(form.get("id"));
  const stock = Math.max(0, Number(form.get("stock")) || 0);
  await db().begin(async (sql) => {
    const previous = await sql<Array<{ stock: number; reserved_stock:number }>>`SELECT stock,reserved_stock FROM product_variants WHERE id=${id} FOR UPDATE`;
    if(!previous[0])throw new AdminInputError("Variant not found.");
    if(stock<previous[0].reserved_stock)throw new AdminInputError("Stock cannot be lower than units reserved by active checkouts.");
    await sql`UPDATE product_variants SET stock=${stock}, updated_at=now() WHERE id=${id}`;
    await sql`INSERT INTO inventory_movements (variant_id, quantity, reason, actor_id) VALUES (${id}, ${stock - (previous[0]?.stock ?? 0)}, 'manual adjustment', ${user.id})`;
    await sql`INSERT INTO audit_logs (actor_id,action,entity_type,entity_id) VALUES (${user.id},'inventory.adjusted','variant',${id})`;
  });
  revalidatePath("/admin/inventory");
  });
}

export async function updateOrder(form: FormData) {
  return runAdminAction("updateOrder", form, async () => {
  const user = await actor();
  const id = String(form.get("id"));
  const status = String(form.get("status"));
  const fulfillment = String(form.get("fulfillment"));
  const tracking=String(form.get("tracking")||"").trim();
  await db().begin(async sql=>{
    const rows=await sql<Array<{status:string;payment_status:string}>>`SELECT status,payment_status FROM orders WHERE id=${id} FOR UPDATE`;
    if(!rows[0])throw new AdminInputError("Order not found.");
    const error=orderUpdateError(rows[0],status,fulfillment,tracking);
    if(error)throw new AdminInputError(error);
    await sql`UPDATE orders SET status=${status}, fulfillment_status=${fulfillment}, tracking_number=${tracking||null}, updated_at=now() WHERE id=${id}`;
    await sql`INSERT INTO audit_logs (actor_id,action,entity_type,entity_id,details) VALUES (${user.id},'order.updated','order',${id},${sql.json({previous:rows[0].status,status,fulfillment,tracking})})`;
  });
  revalidatePath("/admin/orders");
  });
}

export async function bookShipment(form: FormData) {
  return runAdminAction("bookShipment", form, async () => {
  const user = await actor();
  const id = String(form.get("id"));
  const result = await bookOrderShipment(id);
  await audit(user.id, "shipment.booked", "order", id);
  revalidatePath("/admin/orders");
  void result;
  });
}

export async function createDiscount(form: FormData) {
  return runAdminAction("createDiscount", form, async () => {
  const user = await actor();
  const type = String(form.get("type"));
  const code = String(form.get("code") || "").trim().toUpperCase() || null;
  await db()`
    INSERT INTO discounts (name, code, type, value, minimum_quantity, minimum_subtotal, buy_quantity, get_quantity, active, combinable)
    VALUES (${String(form.get("name"))}, ${code}, ${type}, ${Math.max(0, Number(form.get("value")) || 0)}, ${Math.max(0, Number(form.get("minimumQuantity")) || 0)}, ${Math.max(0, Number(form.get("minimumSubtotal")) || 0)}, ${type==='buy_x_get_y'?Number(form.get("buyQuantity")):null}, ${type==='buy_x_get_y'?Number(form.get("getQuantity")):null}, true, ${form.get("combinable") === "on"})
  `;
  await audit(user.id, "discount.created", "discount");
  revalidatePath("/admin/discounts");
  });
}

export async function toggleDiscount(form: FormData) {
  return runAdminAction("toggleDiscount", form, async () => {
  const user = await actor();
  const id = String(form.get("id"));
  await db()`UPDATE discounts SET active=NOT active, updated_at=now() WHERE id=${id}`;
  await audit(user.id, "discount.toggled", "discount", id);
  revalidatePath("/admin/discounts");
  });
}

export async function reviewArtwork(form: FormData) {
  return runAdminAction("reviewArtwork", form, async () => {
  const user = await actor();
  const id = String(form.get("id"));
  const status = String(form.get("status"));
  await db()`UPDATE artworks SET status=${status}, reviewed_by=${user.id}, reviewed_at=now() WHERE id=${id}`;
  await audit(user.id, "artwork.reviewed", "artwork", id);
  revalidatePath("/admin/artwork");
  });
}

export async function saveKeyValue(form: FormData) {
  return runAdminAction("saveKeyValue", form, async () => {
  const user = await actor();
  const table = String(form.get("table"));
  const key = String(form.get("key"));
  const value = { text: String(form.get("value") ?? "") };
  if (table === "content") {
    await db()`INSERT INTO content_blocks (key, value, updated_by) VALUES (${key}, ${db().json(value)}, ${user.id}) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_by=EXCLUDED.updated_by, updated_at=now()`;
    revalidatePath("/admin/content");
    revalidatePath("/");
  } else {
    await db()`INSERT INTO store_settings (key, value, updated_by) VALUES (${key}, ${db().json(value)}, ${user.id}) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_by=EXCLUDED.updated_by, updated_at=now()`;
    revalidatePath("/admin/settings");
    revalidatePath("/checkout");
  }
  await audit(user.id, `${table}.updated`, table, key);
  });
}
