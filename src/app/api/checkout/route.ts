import { NextResponse } from "next/server";
import { z } from "zod";
import { sessionUser } from "@/lib/auth";
import { db, databaseConfigured } from "@/lib/db";
import { METHOD_PRICE } from "@/lib/pricing";

const lineSchema = z.object({
  slug: z.string().min(1), colour: z.string().min(1), size: z.string().min(1),
  method: z.enum(["Custom print", "Embroidery"]), qty: z.number().int().min(1).max(25),
  designs: z.array(z.object({ area: z.string(), label: z.string(), design: z.record(z.string(), z.unknown()) })).max(4),
});
const bodySchema = z.object({
  lines: z.array(lineSchema).min(1).max(30), coupon: z.string().nullable().optional(),
  customer: z.object({
    name: z.string().trim().min(2).max(80), email: z.string().email(), phone: z.string().trim().min(8).max(20),
    line1: z.string().trim().min(4).max(150), line2: z.string().trim().max(150).optional(),
    city: z.string().trim().min(2).max(80), state: z.string().trim().min(2).max(80), postalCode: z.string().trim().min(5).max(10),
  }),
});
type Variant = { variant_id:string;product_id:string;sku:string;stock:number;price:number;name:string;methods:string[] };
type Discount={id:string;name:string;code:string|null;type:string;value:number;minimum_quantity:number;minimum_subtotal:number;buy_quantity:number|null;get_quantity:number|null;combinable:boolean};

function discountAmount(rule:Discount, subtotal:number, quantity:number, unitPrices:number[], shipping:number) {
  if (quantity < rule.minimum_quantity || subtotal < rule.minimum_subtotal) return 0;
  if (rule.type === "percentage") return Math.round(subtotal * rule.value / 100);
  if (rule.type === "fixed") return Math.min(subtotal, rule.value);
  if (rule.type === "free_shipping") return shipping;
  if (rule.type === "buy_x_get_y" && rule.buy_quantity && rule.get_quantity) {
    const freeUnits = Math.floor(quantity / (rule.buy_quantity + rule.get_quantity)) * rule.get_quantity;
    return unitPrices.sort((a,b)=>a-b).slice(0,freeUnits).reduce((sum,price)=>sum+price,0);
  }
  return 0;
}

export async function POST(request: Request) {
  if (!databaseConfigured()) return NextResponse.json({ error: "The PrintEngine commerce database is not connected yet." }, { status: 503 });
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return NextResponse.json({ error: "Razorpay is not connected yet. Your cart remains saved." }, { status: 503 });
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Check the cart and delivery details." }, { status: 400 });
  try {
    const verified: Array<{ line: z.infer<typeof lineSchema>; variant: Variant }> = [];
    for (const line of parsed.data.lines) {
      const rows = await db()<Variant[]>`
        SELECT v.id variant_id,v.product_id,v.sku,v.stock,coalesce(v.price,p.base_price)::int price,p.name,p.methods
        FROM product_variants v JOIN products p ON p.id=v.product_id
        WHERE p.slug=${line.slug} AND v.colour=${line.colour} AND v.size=${line.size}
          AND p.status='active' AND v.active=true LIMIT 1
      `;
      const variant = rows[0];
      if (!variant) throw new Error(`${line.colour} / ${line.size} is unavailable for ${line.slug}.`);
      if (variant.stock < line.qty) throw new Error(`Only ${variant.stock} units remain for ${variant.name} in ${line.colour} / ${line.size}.`);
      if (!variant.methods.includes(line.method)) throw new Error(`${line.method} is unavailable for ${variant.name}.`);
      verified.push({ line, variant });
    }
    const subtotal = verified.reduce((sum,x)=>sum+x.variant.price*x.line.qty,0);
    const decorationTotal = verified.reduce((sum,x)=>sum+METHOD_PRICE[x.line.method]*x.line.designs.length*x.line.qty,0);
    const quantity = verified.reduce((sum,x)=>sum+x.line.qty,0);
    const standardShipping = subtotal >= 999 ? 0 : 79;
    const code = parsed.data.coupon?.trim().toUpperCase() || null;
    const discounts = await db()<Discount[]>`
      SELECT id,name,code,type,value,minimum_quantity,minimum_subtotal,buy_quantity,get_quantity,combinable
      FROM discounts WHERE active=true AND (starts_at IS NULL OR starts_at<=now()) AND (ends_at IS NULL OR ends_at>=now())
        AND (code IS NULL OR code=${code})
    `;
    const unitPrices = verified.flatMap(x=>Array.from({length:x.line.qty},()=>x.variant.price));
    const candidates = discounts.map(rule=>({rule,amount:discountAmount(rule,subtotal,quantity,[...unitPrices],standardShipping)})).filter(x=>x.amount>0);
    const combinable = candidates.filter(x=>x.rule.combinable);
    const bestExclusive = candidates.filter(x=>!x.rule.combinable).sort((a,b)=>b.amount-a.amount)[0];
    const applied = bestExclusive ? [bestExclusive] : combinable;
    const shippingTotal = applied.some(x=>x.rule.type==='free_shipping') ? 0 : standardShipping;
    const discountTotal = applied.filter(x=>x.rule.type!=='free_shipping').reduce((sum,x)=>sum+x.amount,0);
    const grandTotal = Math.max(0,subtotal+decorationTotal-discountTotal+shippingTotal);
    const orderNumber = `PE-${Date.now().toString().slice(-8)}`;
    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method:"POST", headers:{ authorization:`Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,"content-type":"application/json" },
      body:JSON.stringify({ amount:grandTotal*100,currency:"INR",receipt:orderNumber,notes:{source:"printengine-custom"} }), cache:"no-store",
    });
    const razorpay = await razorpayResponse.json() as {id?:string;error?:{description?:string}};
    if (!razorpayResponse.ok || !razorpay.id) throw new Error(razorpay.error?.description || "Razorpay could not create the payment.");
    const user = await sessionUser();
    const address = {name:parsed.data.customer.name,line1:parsed.data.customer.line1,line2:parsed.data.customer.line2??"",city:parsed.data.customer.city,state:parsed.data.customer.state,postalCode:parsed.data.customer.postalCode};
    const created = await db().begin(async sql=>{
      const orders = await sql<Array<{id:string;number:string}>>`
        INSERT INTO orders (number,customer_id,email,phone,shipping_address,subtotal,decoration_total,discount_total,shipping_total,grand_total,discount_id,discount_code,razorpay_order_id)
        VALUES (${orderNumber},${user?.id??null},${parsed.data.customer.email.toLowerCase()},${parsed.data.customer.phone},${sql.json(address)},${subtotal},${decorationTotal},${discountTotal},${shippingTotal},${grandTotal},${applied[0]?.rule.id??null},${code},${razorpay.id!}) RETURNING id,number
      `;
      for (const {line,variant} of verified) await sql`INSERT INTO order_items (order_id,product_id,variant_id,product_name,sku,colour,size,method,quantity,unit_price,decoration_price,designs) VALUES (${orders[0].id},${variant.product_id},${variant.variant_id},${variant.name},${variant.sku},${line.colour},${line.size},${line.method},${line.qty},${variant.price},${METHOD_PRICE[line.method]*line.designs.length},${sql.json(JSON.parse(JSON.stringify(line.designs)))})`;
      return orders[0];
    });
    return NextResponse.json({orderId:created.id,orderNumber:created.number,razorpayOrderId:razorpay.id,keyId,amount:grandTotal*100,currency:"INR",customer:parsed.data.customer});
  } catch(error) {
    return NextResponse.json({error:error instanceof Error?error.message:"Checkout could not be created."},{status:502});
  }
}
