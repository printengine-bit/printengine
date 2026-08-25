import type { CartLine } from "@/lib/pricing";

/**
 * The demo order shown on the sample tracking page and used to seed a first-time
 * cart. Real orders replace this entirely once one has been placed.
 */
export const SAMPLE_ORDER_LINES: CartLine[] = [
  {
    id: "seed-1",
    slug: "fleece-hoodie",
    colour: "Black",
    size: "M",
    method: "Custom print",
    designs: [
      {
        area: "front",
        label: "Front",
        design: { kind: "ai", prompt: "minimal line-art tiger", style: "Minimal line", variant: 1 },
      },
      {
        area: "back",
        label: "Back",
        design: { kind: "ai", prompt: "minimal line-art tiger", style: "Mandala", variant: 2 },
      },
    ],
    qty: 1,
  },
  {
    id: "seed-2",
    slug: "doctor-apron",
    colour: "White",
    size: "L",
    method: "Embroidery",
    designs: [
      {
        area: "front",
        label: "Front",
        design: {
          kind: "text",
          text: "Dr. A. Sharma",
          font: "var(--font-inter), sans-serif",
          colour: "#1f2a44",
        },
      },
    ],
    qty: 1,
  },
  {
    id: "seed-3",
    slug: "oversized-tee",
    colour: "Mustard",
    size: "L",
    method: "Custom print",
    designs: [
      {
        area: "front",
        label: "Front",
        design: { kind: "ai", prompt: "varsity type", style: "Typography", variant: 0 },
      },
    ],
    qty: 1,
    stockLeft: 2,
  },
];
