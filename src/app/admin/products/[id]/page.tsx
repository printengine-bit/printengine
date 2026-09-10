import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import AdminForm from "@/components/admin/AdminForm";
import AdminShell from "@/components/admin/AdminShell";
import ProductMediaManager from "@/components/admin/ProductMediaManager";
import { createVariant, updateProductDetails, updateVariant } from "@/app/admin/actions";
import { adminPageUser, money, shortDate } from "@/lib/admin";
import { db } from "@/lib/db";

const categories=["t-shirts","hoodies","sweatshirts","jerseys","streetwear","sports","accessories","doctor-aprons"];
const kinds=["tee-half","tee-full","polo","oversized","hoodie","sweatshirt","jersey","henley","apron","cargo","varsity","basketball","cap","tote","sling","socks","medical-tunic","medical-wrap-tunic","mens-short-lab-coat","womens-short-lab-coat","scrub-set"];
const field="mt-1 h-10 w-full border border-line bg-white px-3 text-ink";

type ProductRow={id:string;name:string;slug:string;subtitle:string;description:string;category:string;kind:string;fit:string;gsm:number;base_price:number;compare_at_price:number;audience:unknown;methods:unknown;media:unknown;status:string;featured:boolean;is_new:boolean;created_at:Date;updated_at:Date};
type VariantRow={id:string;sku:string;colour:string;colour_hex:string;size:string;price:number|null;stock:number;reserved_stock:number;low_stock_at:number;active:boolean};
type Movement={id:string;sku:string;quantity:number;reason:string;reference:string|null;actor:string|null;created_at:Date};

function stringList(value:unknown){return Array.isArray(value)?value.filter((item):item is string=>typeof item==="string"):[];}

export default async function Page({params}:{params:Promise<{id:string}>}){
  await adminPageUser();const {id}=await params;if(!z.string().uuid().safeParse(id).success)notFound();
  const [products,variants,movements]=await Promise.all([
    db()<ProductRow[]>`SELECT * FROM products WHERE id=${id}`,
    db()<VariantRow[]>`SELECT id,sku,colour,colour_hex,size,price,stock,reserved_stock,low_stock_at,active FROM product_variants WHERE product_id=${id} ORDER BY active DESC,colour,size`,
    db()<Movement[]>`SELECT m.id,v.sku,m.quantity,m.reason,m.reference,u.email actor,m.created_at FROM inventory_movements m JOIN product_variants v ON v.id=m.variant_id LEFT JOIN users u ON u.id=m.actor_id WHERE v.product_id=${id} ORDER BY m.created_at DESC LIMIT 30`,
  ]);
  const product=products[0];if(!product)notFound();const audience=stringList(product.audience);const methods=stringList(product.methods);const media=product.media&&typeof product.media==="object"?product.media as {cover?:{url?:unknown}}:{};const coverUrl=typeof media.cover?.url==="string"?media.cover.url:undefined;
  const total=variants.reduce((sum,item)=>sum+item.stock,0);const reserved=variants.reduce((sum,item)=>sum+item.reserved_stock,0);
  return <AdminShell title={product.name} active="/admin/products">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><Link href="/admin/products" className="text-[13px] underline underline-offset-4">Back to products</Link><Link href={`/product/${product.slug}`} className="border border-ink px-4 py-2 text-[12px]">View storefront product</Link></div>
    <section className="mb-5 grid gap-3 sm:grid-cols-3"><div className="border border-line bg-white p-4"><p className="text-[11px] uppercase tracking-[.08em] text-muted">On hand</p><p className="mt-2 text-2xl">{total}</p></div><div className="border border-line bg-white p-4"><p className="text-[11px] uppercase tracking-[.08em] text-muted">Reserved</p><p className="mt-2 text-2xl">{reserved}</p></div><div className="border border-line bg-white p-4"><p className="text-[11px] uppercase tracking-[.08em] text-muted">Sellable</p><p className="mt-2 text-2xl">{total-reserved}</p></div></section>
    <AdminForm action={updateProductDetails} className="grid gap-5 border border-line bg-white p-5 lg:grid-cols-2">
      <input type="hidden" name="id" value={product.id}/>
      <div className="lg:col-span-2"><h2 className="text-xl font-medium">Product record</h2><p className="mt-1 text-[13px] text-muted">Created {shortDate(product.created_at)} · last changed {shortDate(product.updated_at)}</p></div>
      <label className="text-[11px] text-muted">Name<input required name="name" defaultValue={product.name} className={field}/></label>
      <label className="text-[11px] text-muted">URL slug<input required name="slug" defaultValue={product.slug} className={field}/></label>
      <label className="text-[11px] text-muted lg:col-span-2">Subtitle<input name="subtitle" defaultValue={product.subtitle} className={field}/></label>
      <label className="text-[11px] text-muted lg:col-span-2">Description<textarea name="description" defaultValue={product.description} rows={5} className="mt-1 w-full border border-line p-3 text-ink"/></label>
      <label className="text-[11px] text-muted">Category<select name="category" defaultValue={product.category} className={field}>{categories.map(value=><option key={value}>{value}</option>)}</select></label>
      <label className="text-[11px] text-muted">Garment type<select name="kind" defaultValue={product.kind} className={field}>{kinds.map(value=><option key={value}>{value}</option>)}</select></label>
      <label className="text-[11px] text-muted">Fit<input required name="fit" defaultValue={product.fit} className={field}/></label>
      <label className="text-[11px] text-muted">Fabric GSM<input required name="gsm" type="number" min="0" defaultValue={product.gsm} className={field}/></label>
      <label className="text-[11px] text-muted">Selling price<input required name="price" type="number" min="0" defaultValue={product.base_price} className={field}/></label>
      <label className="text-[11px] text-muted">MRP<input required name="compareAt" type="number" min="0" defaultValue={product.compare_at_price} className={field}/></label>
      <fieldset><legend className="text-[11px] text-muted">Audience</legend><div className="mt-2 flex flex-wrap gap-5">{[["audienceMen","Men"],["audienceWomen","Women"],["audienceKids","Kids"]].map(([name,label])=><label key={name} className="flex items-center gap-2 text-[13px]"><input type="checkbox" name={name} defaultChecked={audience.includes(label)}/>{label}</label>)}</div></fieldset>
      <fieldset><legend className="text-[11px] text-muted">Decoration methods</legend><div className="mt-2 flex flex-wrap gap-5">{[["methodPrint","Custom print"],["methodEmbroidery","Embroidery"]].map(([name,label])=><label key={name} className="flex items-center gap-2 text-[13px]"><input type="checkbox" name={name} defaultChecked={methods.includes(label)}/>{label}</label>)}</div></fieldset>
      <label className="text-[11px] text-muted">Publishing state<select name="status" defaultValue={product.status} className={field}><option>draft</option><option>active</option><option>archived</option></select></label>
      <div className="flex flex-wrap items-end gap-5 pb-2"><label className="flex items-center gap-2 text-[13px]"><input type="checkbox" name="featured" defaultChecked={product.featured}/>Featured</label><label className="flex items-center gap-2 text-[13px]"><input type="checkbox" name="isNew" defaultChecked={product.is_new}/>New badge</label></div>
      <div className="lg:col-span-2"><button className="h-11 bg-ink px-6 text-white">Save product record</button></div>
    </AdminForm>
    <div className="mt-6"><ProductMediaManager productId={product.id} currentUrl={coverUrl}/></div>

    <section className="mt-6"><div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-xl font-medium">Variants</h2><p className="mt-1 text-[13px] text-muted">Stock cannot be set below active checkout reservations. Disable variants instead of deleting history.</p></div><span className="text-[13px] text-muted">{money(product.base_price)} base price</span></div>
      <details className="mt-4 border border-line bg-white p-5"><summary className="cursor-pointer font-medium">Add colour / size variant</summary><AdminForm action={createVariant} className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:items-end"><input type="hidden" name="productId" value={product.id}/><label className="text-[11px] text-muted">Colour<input required name="colour" className={field}/></label><label className="text-[11px] text-muted">Hex<input required name="colourHex" defaultValue="#0a0a0a" className={field}/></label><label className="text-[11px] text-muted">Size<input required name="size" defaultValue="M" className={field}/></label><label className="text-[11px] text-muted">Opening stock<input required name="stock" type="number" min="0" defaultValue="0" className={field}/></label><button className="h-10 bg-lime px-4">Add variant</button></AdminForm></details>
      <div className="mt-4 space-y-3">{variants.map(variant=><AdminForm key={variant.id} action={updateVariant} className="grid gap-3 border border-line bg-white p-4 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_90px_110px_100px_100px_110px_auto] lg:items-end"><input type="hidden" name="id" value={variant.id}/><input type="hidden" name="productId" value={product.id}/><label className="text-[11px] text-muted">SKU<input required name="sku" defaultValue={variant.sku} className={field}/></label><label className="text-[11px] text-muted">Colour<input required name="colour" defaultValue={variant.colour} className={field}/></label><label className="text-[11px] text-muted">Hex<input required name="colourHex" defaultValue={variant.colour_hex} className={field}/></label><label className="text-[11px] text-muted">Size<input required name="size" defaultValue={variant.size} className={field}/></label><label className="text-[11px] text-muted">Price override<input name="price" type="number" min="0" defaultValue={variant.price??""} className={field}/></label><label className="text-[11px] text-muted">On hand<input required name="stock" type="number" min={variant.reserved_stock} defaultValue={variant.stock} className={field}/></label><label className="text-[11px] text-muted">Low stock at<input required name="lowStockAt" type="number" min="0" defaultValue={variant.low_stock_at} className={field}/></label><div><label className="flex h-10 items-center gap-2 text-[12px]"><input type="checkbox" name="active" defaultChecked={variant.active}/>Active</label><button className="h-10 w-full bg-ink px-4 text-white">Save</button></div><p className="text-[11px] text-muted sm:col-span-2 lg:col-span-8">Reserved {variant.reserved_stock} · sellable {variant.stock-variant.reserved_stock}</p></AdminForm>)}</div>
    </section>
    <section className="mt-6 border border-line bg-white"><div className="border-b border-line p-5"><h2 className="text-xl font-medium">Recent stock movement</h2></div><div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-[13px]"><thead className="bg-alt text-[11px] uppercase tracking-[.08em] text-muted"><tr><th className="p-4">Time</th><th>SKU</th><th>Change</th><th>Reason</th><th>Reference / actor</th></tr></thead><tbody className="divide-y divide-line">{movements.map(item=><tr key={item.id}><td className="p-4">{new Date(item.created_at).toLocaleString("en-IN")}</td><td>{item.sku}</td><td className={item.quantity<0?"text-[#a32d2d]":"text-[#5f7f06]"}>{item.quantity>0?"+":""}{item.quantity}</td><td>{item.reason}</td><td>{item.reference??item.actor??"System"}</td></tr>)}</tbody></table>{!movements.length&&<p className="p-5 text-muted">No stock changes recorded yet.</p>}</div></section>
  </AdminShell>;
}
