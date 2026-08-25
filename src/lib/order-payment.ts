import { db } from "@/lib/db";
import { sendOrderConfirmation } from "@/lib/email";

type PaidOrder = { id:string;number:string;email:string;grand_total:number;payment_status:string;discount_id:string|null;reservation_released:boolean };

export async function markOrderPaid(razorpayOrderId:string,paymentId:string|null,internalOrderId?:string){
  const result=await db().begin(async sql=>{
    const rows=await sql<PaidOrder[]>`SELECT id,number,email,grand_total,payment_status,discount_id,reservation_released FROM orders WHERE razorpay_order_id=${razorpayOrderId} AND (${internalOrderId??null}::uuid IS NULL OR id=${internalOrderId??null}::uuid) FOR UPDATE`;
    const order=rows[0];if(!order)return null;if(order.payment_status==='paid')return {order,newlyPaid:false};
    const rowsByItem=await sql<Array<{variant_id:string;quantity:number;stock:number}>>`SELECT i.variant_id,i.quantity,v.stock FROM order_items i JOIN product_variants v ON v.id=i.variant_id WHERE i.order_id=${order.id} ORDER BY i.variant_id FOR UPDATE OF v`;
    const itemMap=new Map<string,{variant_id:string;quantity:number;stock:number}>();
    for(const row of rowsByItem){const current=itemMap.get(row.variant_id);if(current)current.quantity+=row.quantity;else itemMap.set(row.variant_id,{...row});}
    const items=[...itemMap.values()];
    for(const item of items)if(item.stock<item.quantity)throw new Error("Stock changed before payment confirmation. This order requires manual review.");
    await sql`UPDATE orders SET payment_status='paid',status='confirmed',razorpay_payment_id=${paymentId},reservation_released=true,updated_at=now() WHERE id=${order.id}`;
    for(const item of items)await sql`UPDATE product_variants SET stock=stock-${item.quantity},reserved_stock=greatest(0,reserved_stock-${order.reservation_released?0:item.quantity}),updated_at=now() WHERE id=${item.variant_id}`;
    await sql`INSERT INTO inventory_movements (variant_id,quantity,reason,reference) SELECT variant_id,-quantity,'paid order',${order.number} FROM order_items WHERE order_id=${order.id} AND variant_id IS NOT NULL`;
    if(order.discount_id)await sql`UPDATE discounts SET used_count=used_count+1,updated_at=now() WHERE id=${order.discount_id}`;
    await sql`INSERT INTO order_events (order_id,event,details) VALUES (${order.id},'payment_confirmed',${sql.json({paymentId})}) ON CONFLICT (order_id,event) DO NOTHING`;
    return {order,newlyPaid:true};
  });
  if(!result)return null;
  if(result.newlyPaid){try{const sent=await sendOrderConfirmation(result.order.email,result.order.number,result.order.grand_total);if(sent)await db()`INSERT INTO order_events (order_id,event,details) VALUES (${result.order.id},'confirmation_email_sent','{}'::jsonb) ON CONFLICT (order_id,event) DO NOTHING`;}catch(error){console.error("Order confirmation email failed",error);}}
  return {number:result.order.number,newlyPaid:result.newlyPaid};
}
