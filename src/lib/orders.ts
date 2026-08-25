import { COUPONS, lineDecoration, productFor } from "@/lib/pricing";
import { SAMPLE_ORDER_LINES } from "@/lib/sample-order";

export const LIFECYCLE = [
  "Placed",
  "Payment received",
  "Artwork check",
  "In printing",
  "Quality check",
  "Packed",
  "Shipped",
  "Out for delivery",
  "Delivered",
] as const;

export type StageKind = "press" | "garment" | "check" | "receipt" | "box";

export type FeedEntry = {
  title: string;
  when: string;
  by: string;
  kind: StageKind;
};

export const order = {
  id: "PE-24188",
  placedOn: "18 August 2026",
  currentStage: 3,
  status: "In printing",
  lines: SAMPLE_ORDER_LINES,
  coupon: "FIRST150",
  discount: COUPONS.FIRST150.off,
  shipping: 0,
  payment: "UPI · arjun@okhdfcbank",
  eta: "Thursday, 27 August",
  courier: "Delhivery",
  awb: "8829104477",
  address: {
    name: "Arjun Sharma",
    lines: "402 Vasant Vihar, Lucknow, Uttar Pradesh 226010",
    speed: "Standard delivery · free",
  },
  nextSteps: [
    { date: "18", month: "Aug", title: "Artwork check", note: "Design validation in progress" },
    { date: "20", month: "Aug", title: "Printing and embroidery", note: "On the press" },
    { date: "21", month: "Aug", title: "Quality check and packing", note: "Inspected and packed" },
    { date: "22", month: "Aug", title: "Dispatch", note: "Handed to courier" },
  ],
  feed: [
    {
      title: "Front panel printed, sleeve queued next",
      when: "Today, 12:05 pm",
      by: "Imran, print floor",
      kind: "garment" as StageKind,
    },
    {
      title: "Your hoodie went on the press",
      when: "Today, 11:40 am",
      by: "Imran, print floor",
      kind: "press" as StageKind,
    },
    {
      title: "Artwork approved for printing",
      when: "Today, 9:12 am",
      by: "Sunita, artwork check",
      kind: "check" as StageKind,
    },
    {
      title: "Payment received",
      when: "18 August, 8:02 pm",
      by: "Automated",
      kind: "receipt" as StageKind,
    },
  ],
};

export const orderTotals = () => {
  const subtotal = order.lines.reduce((s, l) => {
    const p = productFor(l.slug);
    return s + (p ? p.price * l.qty : 0);
  }, 0);
  const decoration = order.lines.reduce((s, l) => s + lineDecoration(l) * l.qty, 0);
  const total = subtotal + decoration - order.discount + order.shipping;
  return { subtotal, decoration, total };
};

export const allDesigns = order.lines.flatMap((l) =>
  l.designs.map((d) => ({ key: l.id + d.area, design: d.design }))
);
