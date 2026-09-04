import { db,databaseConfigured } from "@/lib/db";

export async function storeConfiguration(){
  if(!databaseConfigured())return {content:{} as Record<string,string>,settings:{} as Record<string,string>};
  const [content,settings]=await Promise.all([
    db()<Array<{key:string;value:{text?:string}}>>`SELECT key,value FROM content_blocks`,
    db()<Array<{key:string;value:{text?:string}}>>`SELECT key,value FROM store_settings`,
  ]);
  const toMap=(rows:Array<{key:string;value:{text?:string}}>)=>Object.fromEntries(rows.map(x=>[x.key,x.value.text??""]));
  return {content:toMap(content),settings:toMap(settings)};
}

export function shippingPolicy(settings:Record<string,string>){
  const read=(key:string,fallback:number)=>{const value=settings[key];return value!==undefined&&/^\d+$/.test(value)&&Number.isSafeInteger(Number(value))?Number(value):fallback;};
  return {threshold:read("free_shipping_threshold",999),fee:read("standard_shipping_fee",79)};
}
