"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Garment from "@/components/ui/Garment";
import DesignRender from "@/components/product/DesignRender";
import { ArrowRight, Lock, Repeat, Truck } from "@/components/ui/icons";
import { inr } from "@/lib/catalog";
import { lineTotal, productFor, useCart } from "@/lib/cart-store";

type RazorpayResult={razorpay_order_id:string;razorpay_payment_id:string;razorpay_signature:string};
type RazorpayOptions={key:string;amount?:number;currency?:string;name:string;description?:string;order_id:string;prefill:Record<string,string>;theme:Record<string,string>;handler:(result:RazorpayResult)=>void;modal:{ondismiss:()=>void}};
declare global { interface Window { Razorpay?: new (options:RazorpayOptions)=>{open:()=>void} } }

function loadRazorpay(){
  if(window.Razorpay)return Promise.resolve();
  return new Promise<void>((resolve,reject)=>{const script=document.createElement("script");script.src="https://checkout.razorpay.com/v1/checkout.js";script.onload=()=>resolve();script.onerror=()=>reject(new Error("Razorpay could not be loaded."));document.head.appendChild(script);});
}

export default function CheckoutView({shippingPolicy={threshold:999,fee:79}}:{shippingPolicy?:{threshold:number;fee:number}}) {
  const { hydrated, lines, totals:cartTotals, coupon, itemCount, clearCart } = useCart();
  const shipping=cartTotals.subtotal>=shippingPolicy.threshold||!lines.length?0:shippingPolicy.fee;
  const totals={...cartTotals,shipping,total:Math.max(0,cartTotals.total-cartTotals.shipping+shipping)};
  const router = useRouter();
  const [consent, setConsent] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customer, setCustomer] = useState({ name: "", email: "", phone: "", line1: "", line2: "", city: "", state: "", postalCode: "" });

  const continueToPayment = async () => {
    if (!consent) {
      setError("Confirm that your custom design is final before continuing.");
      return;
    }
    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ lines, coupon, customer }),
      });
      const result = (await response.json()) as { orderId?:string;orderNumber?:string;accessToken?:string;razorpayOrderId?:string;keyId?:string;amount?:number;currency?:string;error?: string };
      if (!response.ok || !result.orderId || !result.accessToken || !result.razorpayOrderId || !result.keyId) {
        throw new Error(result.error || "Secure checkout is temporarily unavailable.");
      }
      const orderAccessToken=result.accessToken;
      await loadRazorpay();
      const Razorpay = window.Razorpay;
      if (!Razorpay) throw new Error("The payment window could not be loaded.");
      const payment = new Razorpay({
        key: result.keyId, amount: result.amount, currency: result.currency, name: "printengine",
        description: result.orderNumber, order_id: result.razorpayOrderId,
        prefill: { name: customer.name, email: customer.email, contact: customer.phone },
        theme: { color: "#b8f20a" },
        handler: async (paid) => {
          const verified = await fetch("/api/payments/razorpay/verify", { method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({orderId:result.orderId,razorpayOrderId:paid.razorpay_order_id,razorpayPaymentId:paid.razorpay_payment_id,signature:paid.razorpay_signature}) });
          const verification = await verified.json() as {orderNumber?:string;error?:string};
          if(!verified.ok||!verification.orderNumber){setError(verification.error??"Payment verification failed. Contact support before retrying.");setPending(false);return;}
          localStorage.setItem("printengine.lastOrder",JSON.stringify({id:verification.orderNumber,accessToken:orderAccessToken,lines,totals,coupon,speed:"Standard delivery",placedAt:new Date().toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})}));
          clearCart();
          router.push(`/order/${verification.orderNumber}/confirmed?access=${encodeURIComponent(orderAccessToken)}`);
        }, modal: { ondismiss: () => setPending(false) },
      });
      payment.open();
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Secure checkout is temporarily unavailable. Your cart is still saved."
      );
      setPending(false);
    }
  };

  if (!hydrated) {
    return (
      <div className="container-pe py-10">
        <div className="h-64 animate-pulse border border-line bg-alt" aria-hidden />
        <p className="sr-only">Loading checkout</p>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="container-pe py-20 text-center">
        <h2 className="text-[24px] font-medium tracking-[-0.02em]">Your cart is empty</h2>
        <p className="mt-2 text-[14px] text-muted">Add something before checking out.</p>
        <Link href="/shop" className="mt-7 inline-flex h-12 items-center bg-lime px-8 text-btn text-ink">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="container-pe grid gap-8 py-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)] lg:gap-10">
      <div className="min-w-0 space-y-5">
        <section className="border border-line p-5 lg:p-7">
          <p className="text-[11px] uppercase tracking-[0.12em] text-muted">Step 1</p>
          <h2 className="mt-2 text-[22px] font-medium tracking-[-0.02em]">Review your custom items</h2>
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-muted">
            Confirm the garment, size, colour and artwork below. Contact details, delivery address
            and payment are completed securely by PrintEngine and Razorpay.
          </p>

          <ul className="mt-6 divide-y divide-line border-y border-line">
            {lines.map((line) => {
              const product = productFor(line.slug);
              if (!product) return null;
              return (
                <li key={line.id} className="flex gap-4 py-5">
                  <div className="relative h-24 w-20 shrink-0 bg-alt">
                    <Garment kind={product.kind} className="h-full w-full p-2" />
                    <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center bg-ink px-1 text-[11px] text-white">
                      {line.qty}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap justify-between gap-2">
                      <div>
                        <p className="text-[15px]">{product.name}</p>
                        <p className="mt-1 text-[12px] text-muted">
                          {line.colour} · {line.size} · {line.method}
                        </p>
                      </div>
                      <p className="text-[14px] font-medium">{inr(lineTotal(line))}</p>
                    </div>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {line.designs.map((design) => (
                        <li key={design.area} className="flex items-center gap-2 border border-line px-2 py-1.5">
                          <span className="h-7 w-7 bg-alt p-0.5">
                            <DesignRender design={design.design} />
                          </span>
                          <span className="text-[11px] text-muted">{design.label}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={`/product/${product.slug}?line=${line.id}`}
                      className="mt-3 inline-block text-[12px] underline underline-offset-4"
                    >
                      Edit this item
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="border border-line p-5 lg:p-7">
          <p className="text-[11px] uppercase tracking-[0.12em] text-muted">Step 2</p>
          <h2 className="mt-2 text-[18px] font-medium">Delivery details</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {[
              ["name","Full name","text"],["email","Email","email"],["phone","Phone","tel"],["postalCode","Pincode","text"],
              ["line1","Address","text"],["line2","Apartment, landmark (optional)","text"],["city","City","text"],["state","State","text"],
            ].map(([key,label,type])=><label key={key} className={key==='line1'||key==='line2'?"text-[13px] sm:col-span-2":"text-[13px]"}>{label}<input type={type} required={key!=='line2'} value={customer[key as keyof typeof customer]} onChange={event=>setCustomer(previous=>({...previous,[key]:event.target.value}))} className="mt-2 h-11 w-full border border-line px-3 focus:border-ink focus:outline-none"/></label>)}
          </div>
        </section>

        <section className="border border-line bg-alt p-5 lg:p-7">
          <p className="text-[11px] uppercase tracking-[0.12em] text-muted">Step 3</p>
          <h2 className="mt-2 text-[18px] font-medium">Confirm your artwork</h2>
          <label className="mt-4 flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => {
                setConsent(event.target.checked);
                setError(null);
              }}
              className="mt-1 h-4 w-4 accent-ink"
            />
            <span>
              <span className="block text-[14px]">My design, spelling, placement and size are final.</span>
              <span className="mt-1 block text-[12px] leading-relaxed text-muted">
                Custom items cannot be returned for a change of mind. Print defects are reprinted
                free of charge.
              </span>
            </span>
          </label>
        </section>

        <ul className="grid gap-3 sm:grid-cols-3">
          {[
            { Icon: Lock, title: "Secure payment", note: "UPI, cards and net banking" },
            { Icon: Truck, title: "Tracked delivery", note: "Live updates after dispatch" },
            { Icon: Repeat, title: "Print guarantee", note: "Free reprint for defects" },
          ].map(({ Icon, title, note }) => (
            <li key={title} className="border border-line p-4">
              <Icon className="h-5 w-5" />
              <p className="mt-3 text-[13px] font-medium">{title}</p>
              <p className="mt-1 text-[12px] text-muted">{note}</p>
            </li>
          ))}
        </ul>
      </div>

      <aside className="min-w-0">
        <div className="border border-line p-5 lg:sticky lg:top-6 lg:p-6">
          <div className="flex items-baseline justify-between">
            <h2 className="text-[18px] font-medium">Order summary</h2>
            <span className="text-[13px] text-muted">{itemCount} items</span>
          </div>
          <dl className="mt-5 space-y-2.5 border-t border-line pt-5 text-[14px]">
            <div className="flex justify-between"><dt className="text-muted">Garments</dt><dd>{inr(totals.subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Decoration</dt><dd>{inr(totals.decoration)}</dd></div>
            {totals.adjustments.map((adjustment) => (
              <div key={adjustment.id} className="flex justify-between gap-4 text-[#5f7f06]">
                <dt>{adjustment.label}</dt><dd className="shrink-0">−{inr(adjustment.amount)}</dd>
              </div>
            ))}
            <div className="flex justify-between">
              <dt className="text-muted">Standard delivery</dt>
              <dd className={totals.shipping === 0 ? "text-[#5f7f06]" : ""}>
                {totals.shipping === 0 ? "Free" : inr(totals.shipping)}
              </dd>
            </div>
          </dl>
          <div className="mt-5 flex items-baseline justify-between border-t border-line pt-5">
            <span className="text-[15px]">Estimated total</span>
            <span className="text-[20px] font-medium">{inr(totals.total)}</span>
          </div>
          <p className="mt-1 text-right text-[12px] text-muted">
            Final taxes, discounts and delivery are confirmed at secure checkout.
          </p>
          <button
            type="button"
            onClick={continueToPayment}
            disabled={pending}
            className="mt-5 flex h-12 w-full items-center justify-center gap-2 bg-lime text-btn text-ink transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "Preparing Razorpay…" : "Pay securely with Razorpay"}
            {!pending && <ArrowRight className="h-4 w-4" />}
          </button>
          {error && <p className="mt-3 text-[13px] leading-relaxed text-[#a32d2d]" role="alert">{error}</p>}
          <p className="mt-4 text-center text-[11px] leading-relaxed text-muted">
            Payment details are entered only on the secure checkout page and are never stored by printengine.
          </p>
        </div>
      </aside>
    </div>
  );
}
