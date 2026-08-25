import { db } from "@/lib/db";

export async function markOrderPaid(razorpayOrderId:string,paymentId:string|null){
  return db().begin(async sql=>{
    const rows=await sql<Array<{id:string;number:string;payment_status:string;discount_id:string|null}>>`SELECT id,number,payment_status,discount_id FROM orders WHERE razorpay_order_id=${razorpayOrderId} FOR UPDATE`;
    const order=rows[0];if(!order)return null;if(order.payment_status==='paid')return order.number;
    await sql`UPDATE orders SET payment_status='paid',status='confirmed',razorpay_payment_id=${paymentId},updated_at=now() WHERE id=${order.id}`;
    await sql`UPDATE product_variants v SET stock=greatest(0,v.stock-i.quantity),updated_at=now() FROM order_items i WHERE i.order_id=${order.id} AND i.variant_id=v.id`;
    await sql`INSERT INTO inventory_movements (variant_id,quantity,reason,reference) SELECT variant_id,-quantity,'paid order',${order.number} FROM order_items WHERE order_id=${order.id} AND variant_id IS NOT NULL`;
    if(order.discount_id)await sql`UPDATE discounts SET used_count=used_count+1,updated_at=now() WHERE id=${order.discount_id}`;
    return order.number;
  });
}
