export type InvoiceLine = { name: string; detail: string; qty: number; amount: number };

export function buildInvoice(opts: {
  orderId: string;
  placedOn: string;
  lines: InvoiceLine[];
  subtotal: number;
  decoration: number;
  discount: number;
  shipping: number;
  total: number;
}): string {
  const rupee = (n: number) => "Rs " + n.toLocaleString("en-IN");
  const pad = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + "-" : s.padEnd(n));
  const rows = opts.lines
    .map((l) => pad(l.name, 34) + pad(l.detail, 26) + String(l.qty).padStart(4) + rupee(l.amount).padStart(14))
    .join("\n");

  return [
    "printengine",
    "Lucknow, Uttar Pradesh, India",
    "GSTIN 09AAAAA0000A1Z5",
    "",
    "TAX INVOICE",
    "Order " + opts.orderId,
    "Placed " + opts.placedOn,
    "",
    pad("Item", 34) + pad("Details", 26) + "Qty".padStart(4) + "Amount".padStart(14),
    "-".repeat(78),
    rows,
    "-".repeat(78),
    pad("", 60) + "Subtotal".padEnd(4) + rupee(opts.subtotal).padStart(14),
    pad("", 60) + "Decoration".padEnd(4) + rupee(opts.decoration).padStart(14),
    pad("", 60) + "Discount".padEnd(4) + ("-" + rupee(opts.discount)).padStart(14),
    pad("", 60) + "Shipping".padEnd(4) + (opts.shipping === 0 ? "Free" : rupee(opts.shipping)).padStart(14),
    pad("", 60) + "TOTAL".padEnd(4) + rupee(opts.total).padStart(14),
    "",
    "All amounts inclusive of GST.",
    "Custom printed items are made to order and cannot be returned for a change of mind.",
    "We reprint free of charge for any print defect.",
    "",
  ].join("\n");
}

export function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
