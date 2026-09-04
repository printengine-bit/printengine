import { z } from "zod";

const id = z.string().uuid("Invalid record identifier.");
const text = z.string().trim().min(1).max(200);
const integer = z.string().regex(/^\d+$/, "Use a non-negative whole number.").transform(Number).pipe(z.number().int().max(100000000));
const variant = { colour: text, colourHex: z.string().regex(/^#[0-9a-f]{6}$/i, "Use a six-digit hex colour."), size: text.max(30), stock: integer };
export const adminSchemas = {
  createProduct: z.object({ name: text, slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use a lowercase, hyphen-separated slug."), subtitle: z.string().max(500), category: z.enum(["t-shirts","hoodies","sweatshirts","jerseys","doctor-aprons"]), kind: z.enum(["tee-half","tee-full","polo","oversized","hoodie","sweatshirt","jersey","henley","apron"]), fit: text, gsm: integer, price: integer, mrp: integer, ...variant }).refine(v=>v.mrp>=v.price,{message:"MRP cannot be lower than the selling price."}),
  createVariant: z.object({productId:id,...variant}),
  updateProduct: z.object({id,price:integer,compareAt:integer,status:z.enum(["draft","active","archived"])}).refine(v=>v.compareAt>=v.price,{message:"MRP cannot be lower than the selling price."}),
  updateInventory: z.object({id,stock:integer}),
  updateOrder: z.object({id,status:z.enum(["pending","confirmed","in_production","shipped","delivered"]),fulfillment:z.enum(["unfulfilled","processing","fulfilled","returned"]),tracking:z.string().trim().max(120)}),
  bookShipment: z.object({id}),
  createDiscount: z.object({name:text,code:z.string().regex(/^[a-z0-9_-]*$/i).max(50),type:z.enum(["percentage","fixed","free_shipping","buy_x_get_y"]),value:integer,minimumQuantity:integer,minimumSubtotal:integer,buyQuantity:integer.optional(),getQuantity:integer.optional()}).superRefine((v,ctx)=>{
    if(v.type==="percentage" && (v.value<1||v.value>100))ctx.addIssue({code:"custom",message:"Percentage discounts must be between 1 and 100."});
    if(v.type==="fixed" && v.value<1)ctx.addIssue({code:"custom",message:"Fixed discounts must be greater than zero."});
    if(v.type==="buy_x_get_y" && (!v.buyQuantity||!v.getQuantity))ctx.addIssue({code:"custom",message:"Specify positive Buy and Get quantities."});
  }),
  toggleDiscount:z.object({id}),
  reviewArtwork:z.object({id,status:z.enum(["pending","approved","changes_requested","rejected"])}),
  saveKeyValue:z.object({table:z.enum(["content","settings"]),key:text,value:z.string().max(5000)}).superRefine((v,ctx)=>{
    const allowed=v.table==="content"?["announcement","hero_title","hero_body","support_message"]:["store_name","support_email","support_phone","gstin","free_shipping_threshold","standard_shipping_fee","order_prefix"];
    if(!allowed.includes(v.key))ctx.addIssue({code:"custom",message:"Unknown setting."});
    if(["free_shipping_threshold","standard_shipping_fee"].includes(v.key)&&!integer.safeParse(v.value).success)ctx.addIssue({code:"custom",message:"Shipping values must be non-negative whole rupees."});
    if(v.key==="support_email"&&!z.string().email().safeParse(v.value).success)ctx.addIssue({code:"custom",message:"Enter a valid support email."});
  }),
};

export type AdminActionResult = {ok:boolean;message:string};
export class AdminInputError extends Error {}

export function orderUpdateError(current:{status:string;payment_status:string},next:string,fulfillment:string,tracking:string):string|null {
  if(["cancelled","refunded"].includes(current.status))return "Closed orders cannot be edited through the status form.";
  const steps=["pending","confirmed","in_production","shipped","delivered"];
  const from=steps.indexOf(current.status),to=steps.indexOf(next);
  if(from<0||to<from||to>from+1)return "Move the order forward one stage at a time.";
  if(next!=="pending"&&current.payment_status!=="paid")return "Payment must be confirmed before production or fulfilment.";
  if(["shipped","delivered"].includes(next)&&!tracking.trim())return "A tracking number is required before marking an order shipped.";
  if(["shipped","delivered"].includes(next)&&fulfillment!=="fulfilled")return "Shipped orders must have fulfilled status.";
  if(!["shipped","delivered"].includes(next)&&["fulfilled","returned"].includes(fulfillment))return "Fulfilment cannot precede shipment.";
  return null;
}
