"use client";

import { useState } from "react";
import { inr, products } from "@/lib/catalog";
import { submitLead } from "@/lib/leads";

const SEGMENTS = ["Corporate", "College or fest", "Sports team", "Clinic or hospital"];

function slab(qty: number) {
  if (qty >= 200) return { off: 0.25, label: "200 or more" };
  if (qty >= 50) return { off: 0.18, label: "50 to 199" };
  if (qty >= 10) return { off: 0.1, label: "10 to 49" };
  return { off: 0, label: "Under 10" };
}

export default function BulkQuoteForm() {
  const [slug, setSlug] = useState("classic-half-sleeve-tee");
  const [qty, setQty] = useState(50);
  const [segment, setSegment] = useState(SEGMENTS[0]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const product = products.find((p) => p.slug === slug)!;
  const s = slab(qty);
  const unit = Math.round(product.price * (1 - s.off));
  const decoration = 149;
  const perPiece = unit + decoration;
  const total = perPiece * qty;

  const submit = async () => {
    if (!name.trim()) {
      setError("Tell us who to contact.");
      return;
    }
    if (!/^[\d\s+]{10,15}$/.test(phone.trim())) {
      setError("Enter a valid phone number.");
      return;
    }
    if (qty < 10) {
      setError("Bulk pricing starts at 10 pieces.");
      return;
    }
    setError(null);
    setSending(true);
    try {
      await submitLead({ type: "bulk-quote", name: name.trim(), phone: phone.trim(), segment, qty, product: product.slug });
      setSent(`Quote request sent for ${qty} × ${product.name}. We will call within one working day.`);
    } catch (failure) {
      setSent(null);
      setError(failure instanceof Error ? failure.message : "We could not send your quote request.");
    } finally {
      setSending(false);
    }
  };

  const field =
    "h-11 w-full border border-line bg-white px-3 text-[14px] focus:border-ink focus:outline-none";

  return (
    <section id="quote" className="border-y border-line bg-alt">
      <div className="container-pe section-pe grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14">
        <div className="min-w-0">
          <h2 className="text-h2">Request a quote</h2>
          <p className="mt-2 max-w-xl text-[15px] text-muted">
            Pick a garment and a quantity to see indicative pricing straight away, then leave your
            number and we will confirm it.
          </p>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-[13px] text-muted">Garment</span>
              <select value={slug} onChange={(e) => setSlug(e.target.value)} className={field}>
                {products.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-[13px] text-muted">Quantity</span>
              <input
                type="number"
                min={1}
                max={5000}
                value={qty}
                onChange={(e) => {
                  setQty(Math.max(1, Math.min(5000, Number(e.target.value) || 1)));
                  setSent(null);
                  if (error) setError(null);
                }}
                className={field}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[13px] text-muted">Segment</span>
              <select value={segment} onChange={(e) => setSegment(e.target.value)} className={field}>
                {SEGMENTS.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-[13px] text-muted">Contact name</span>
              <input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError(null);
                }}
                className={field}
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-2 block text-[13px] text-muted">Phone number</span>
              <input
                inputMode="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="+91 98765 43210"
                className={field + " sm:max-w-xs"}
              />
            </label>
          </div>

          {error && <p className="mt-4 text-[13px] text-[#a32d2d]">{error}</p>}
          {sent && (
            <p className="mt-4 text-[13px] text-[#5f7f06]" aria-live="polite">
              {sent}
            </p>
          )}

          <button
            type="button"
            onClick={submit}
            disabled={sending}
            className="mt-6 h-12 bg-ink px-8 text-btn text-white transition-opacity hover:opacity-90"
          >
            {sending ? "Sending…" : "Send quote request"}
          </button>
        </div>

        <aside className="min-w-0">
          <div className="border border-line bg-white p-6 lg:sticky lg:top-28">
            <p className="text-[11px] uppercase tracking-[0.12em] text-muted">Indicative pricing</p>
            <p className="mt-4 text-[15px]">{product.name}</p>
            <p className="mt-1 text-[13px] text-muted">
              {qty} pieces · slab {s.label}
            </p>

            <dl className="mt-5 space-y-2.5 border-t border-line pt-5 text-[14px]">
              <div className="flex justify-between">
                <dt className="text-muted">List price</dt>
                <dd>{inr(product.price)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Bulk discount</dt>
                <dd className={s.off > 0 ? "text-[#5f7f06]" : ""}>
                  {s.off > 0 ? `−${Math.round(s.off * 100)}%` : "—"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Unit price</dt>
                <dd>{inr(unit)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Print, one area</dt>
                <dd>{inr(decoration)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Per piece</dt>
                <dd>{inr(perPiece)}</dd>
              </div>
            </dl>

            <div className="mt-5 flex items-baseline justify-between border-t border-line pt-5">
              <span className="text-[15px]">Estimated total</span>
              <span className="text-[20px] font-medium">{inr(total)}</span>
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-muted">
              Indicative only, inclusive of GST. Final quote confirmed after we see your artwork.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
