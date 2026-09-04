import { products as fallbackProducts, type Audience, type Method, type Product, type Size } from "@/lib/catalog";
import { databaseConfigured, db } from "@/lib/db";

type ProductRow={id:string;slug:string;name:string;subtitle:string;category:Product["category"];kind:Product["kind"];fit:string;gsm:number;base_price:number;compare_at_price:number;audience:Audience[];methods:Method[];featured:boolean;is_new:boolean};
type VariantRow={product_id:string;colour:string;size:Size;stock:number};

export async function commerceProducts():Promise<Product[]>{
  if(!databaseConfigured())return fallbackProducts;
  try{
    const [productRows,variantRows]=await Promise.all([
      db()<ProductRow[]>`SELECT id,slug,name,subtitle,category,kind,fit,gsm,base_price,compare_at_price,audience,methods,featured,is_new FROM products WHERE status='active' ORDER BY created_at`,
      db()<VariantRow[]>`SELECT product_id,colour,size,stock FROM product_variants WHERE active=true ORDER BY created_at`,
    ]);
    return productRows.map(row=>{
      const variants=variantRows.filter(variant=>variant.product_id===row.id);
      return {slug:row.slug,name:row.name,subtitle:row.subtitle,price:row.base_price,mrp:row.compare_at_price,kind:row.kind,category:row.category,audience:row.audience,fit:row.fit,gsm:row.gsm,colours:[...new Set(variants.map(v=>v.colour))],sizes:[...new Set(variants.map(v=>v.size))],methods:row.methods,stock:variants.reduce((sum,v)=>sum+v.stock,0),bestseller:row.featured,isNew:row.is_new};
    });
  }catch(error){
    // A database outage or an intentionally empty catalogue must not resurrect
    // archived products with sample prices and availability.
    if(process.env.NODE_ENV==='production')throw error;
    return fallbackProducts;
  }
}
