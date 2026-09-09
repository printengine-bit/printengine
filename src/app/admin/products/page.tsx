import AdminForm from "@/components/admin/AdminForm";
import AdminShell from "@/components/admin/AdminShell";
import Link from "next/link";
import { createProduct, updateProduct } from "@/app/admin/actions";
import { adminPageUser, money } from "@/lib/admin";
import { db } from "@/lib/db";

const PRODUCT_CATEGORIES = [
  "t-shirts", "hoodies", "sweatshirts", "jerseys",
  "streetwear", "sports", "accessories", "doctor-aprons",
];

const GARMENT_KINDS = [
  "tee-half", "tee-full", "polo", "oversized", "hoodie", "sweatshirt",
  "jersey", "henley", "apron", "cargo", "varsity", "basketball", "cap",
  "tote", "sling", "socks", "medical-tunic", "medical-wrap-tunic",
  "mens-short-lab-coat", "womens-short-lab-coat", "scrub-set",
];

type Row = {
  id: string; name: string; slug: string; category: string;
  base_price: number; compare_at_price: number; status: string;
  variants: number; stock: number;
};

const fieldClass = "mt-1 h-10 w-full border border-line px-3 text-ink";

export default async function Page() {
  await adminPageUser();
  const rows = await db()<Row[]>`
    SELECT p.id,p.name,p.slug,p.category,p.base_price,p.compare_at_price,p.status,
      count(v.id)::int variants,coalesce(sum(v.stock),0)::int stock
    FROM products p LEFT JOIN product_variants v ON v.product_id=p.id
    GROUP BY p.id ORDER BY p.created_at
  `;

  return (
    <AdminShell title="Products" active="/admin/products">
      <details className="mb-5 border border-line bg-white p-5">
        <summary className="cursor-pointer font-medium">Add a product</summary>
        <AdminForm action={createProduct} className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-[11px] text-muted">Name<input required name="name" className={fieldClass}/></label>
          <label className="text-[11px] text-muted">Slug<input required name="slug" className={fieldClass}/></label>
          <label className="text-[11px] text-muted">Subtitle<input name="subtitle" className={fieldClass}/></label>
          <label className="text-[11px] text-muted">Category
            <select name="category" className={fieldClass}>{PRODUCT_CATEGORIES.map((value) => <option key={value}>{value}</option>)}</select>
          </label>
          <label className="text-[11px] text-muted">Garment type
            <select name="kind" className={fieldClass}>{GARMENT_KINDS.map((value) => <option key={value}>{value}</option>)}</select>
          </label>
          <label className="text-[11px] text-muted">Fit<input name="fit" defaultValue="Regular" className={fieldClass}/></label>
          <label className="text-[11px] text-muted">GSM<input name="gsm" defaultValue="0" type="number" min="0" className={fieldClass}/></label>
          <label className="text-[11px] text-muted">Price<input required name="price" type="number" min="0" className={fieldClass}/></label>
          <label className="text-[11px] text-muted">MRP<input required name="mrp" type="number" min="0" className={fieldClass}/></label>
          <label className="text-[11px] text-muted">First colour<input name="colour" defaultValue="Black" className={fieldClass}/></label>
          <label className="text-[11px] text-muted">Colour hex<input name="colourHex" defaultValue="#0a0a0a" className={fieldClass}/></label>
          <label className="text-[11px] text-muted">First size<input name="size" defaultValue="M" className={fieldClass}/></label>
          <label className="text-[11px] text-muted">Opening stock<input name="stock" type="number" min="0" defaultValue="0" className={fieldClass}/></label>
          <button className="h-10 bg-lime px-5 lg:self-end">Create as draft</button>
        </AdminForm>
      </details>

      <p className="mb-5 text-[14px] text-muted">Edit pricing and publishing state. Variant-level quantities live under Inventory.</p>
      <div className="space-y-3">
        {rows.map((product) => (
          <AdminForm action={updateProduct} key={product.id} className="grid gap-4 border border-line bg-white p-5 lg:grid-cols-[minmax(220px,1fr)_120px_120px_140px_auto] lg:items-end">
            <input type="hidden" name="id" value={product.id}/>
            <div><Link href={`/admin/products/${product.id}`} className="font-medium underline-offset-4 hover:underline">{product.name}</Link><p className="mt-1 text-[12px] text-muted">{product.slug} · {product.category} · {product.variants} variants · {product.stock} units</p></div>
            <label className="text-[11px] text-muted">Selling price<input name="price" type="number" min="0" defaultValue={product.base_price} className={fieldClass}/></label>
            <label className="text-[11px] text-muted">MRP<input name="compareAt" type="number" min="0" defaultValue={product.compare_at_price} className={fieldClass}/></label>
            <label className="text-[11px] text-muted">Status<select name="status" defaultValue={product.status} className={fieldClass}><option>active</option><option>draft</option><option>archived</option></select></label>
            <div className="flex gap-2"><Link href={`/admin/products/${product.id}`} className="flex h-10 items-center border border-ink px-4 text-[12px]">Manage</Link><button className="h-10 bg-ink px-5 text-[12px] text-white">Quick save</button></div>
            <span className="sr-only">Current price {money(product.base_price)}</span>
          </AdminForm>
        ))}
      </div>
    </AdminShell>
  );
}
