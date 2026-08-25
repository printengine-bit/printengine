import type { Design } from "@/lib/design";

export const accountUser = {
  name: "Arjun Sharma",
  phone: "+91 98765 43210",
  initials: "AS",
};

export const ACCOUNT_NAV = [
  { slug: "orders", label: "Orders", href: "/account/orders" },
  { slug: "designs", label: "My designs", href: "/account/designs" },
  { slug: "wishlist", label: "Wishlist", href: "/account/wishlist" },
  { slug: "addresses", label: "Addresses", href: "/account/addresses" },
  { slug: "size", label: "Size profile", href: "/account/size" },
  { slug: "support", label: "Support", href: "/account/support" },
] as const;

export type OrderStatus = "In printing" | "Delivered" | "Cancelled";

export type OrderSummary = {
  id: string;
  placedOn: string;
  status: OrderStatus;
  total: number;
  itemCount: number;
  note?: string;
  thumbs: { slug: string; design: Design }[];
};

export const orderSummaries: OrderSummary[] = [
  {
    id: "PE-24188",
    placedOn: "18 August 2026",
    status: "In printing",
    total: 3793,
    itemCount: 3,
    note: "Artwork approved — printing started today",
    thumbs: [
      {
        slug: "fleece-hoodie",
        design: { kind: "ai", prompt: "minimal line-art tiger", style: "Minimal line", variant: 1 },
      },
      {
        slug: "doctor-apron",
        design: {
          kind: "text",
          text: "Dr. A. Sharma",
          font: "var(--font-inter), sans-serif",
          colour: "#1f2a44",
        },
      },
      {
        slug: "oversized-tee",
        design: { kind: "ai", prompt: "varsity type", style: "Typography", variant: 0 },
      },
    ],
  },
  {
    id: "PE-24102",
    placedOn: "2 August 2026",
    status: "Delivered",
    total: 1748,
    itemCount: 1,
    note: "Delivered on 9 August 2026",
    thumbs: [
      {
        slug: "premium-polo",
        design: { kind: "ai", prompt: "clinic monogram", style: "Minimal line", variant: 3 },
      },
    ],
  },
  {
    id: "PE-23990",
    placedOn: "14 July 2026",
    status: "Cancelled",
    total: 1099,
    itemCount: 1,
    note: "Cancelled on 15 July 2026 · refunded to UPI",
    thumbs: [
      {
        slug: "crew-sweatshirt",
        design: { kind: "ai", prompt: "mandala back print", style: "Mandala", variant: 2 },
      },
    ],
  },
];

export type DesignSource = "ai" | "upload" | "text";

export type SavedDesign = {
  id: string;
  name: string;
  source: DesignSource;
  detail: string;
  savedOn: string;
  usedIn: number;
  liked: boolean;
  design: Design;
};

export const savedDesigns: SavedDesign[] = [
  {
    id: "d1",
    name: "Cybernetic feline crest",
    source: "ai",
    detail: "geometric mechanical tiger, single colour",
    savedOn: "18 Aug",
    usedIn: 1,
    liked: true,
    design: { kind: "ai", prompt: "geometric mechanical tiger", style: "Minimal line", variant: 1 },
  },
  {
    id: "d2",
    name: "Zen mountain minimal",
    source: "ai",
    detail: "single line drawing of a mountain range",
    savedOn: "12 Aug",
    usedIn: 0,
    liked: false,
    design: { kind: "ai", prompt: "single line mountain range", style: "Minimal line", variant: 2 },
  },
  {
    id: "d3",
    name: "Studio branding logo",
    source: "upload",
    detail: "studio24-master-black.svg",
    savedOn: "5 Aug",
    usedIn: 4,
    liked: false,
    design: { kind: "ai", prompt: "studio24 master mark", style: "Streetwear", variant: 0 },
  },
  {
    id: "d4",
    name: "Ink drop abstraction",
    source: "ai",
    detail: "black ink diffusing in water, macro",
    savedOn: "1 Aug",
    usedIn: 1,
    liked: true,
    design: { kind: "ai", prompt: "black ink diffusing in water", style: "Mandala", variant: 0 },
  },
  {
    id: "d5",
    name: "Lab coat name",
    source: "text",
    detail: "Dr. A. Sharma · Inter medium",
    savedOn: "28 Jul",
    usedIn: 2,
    liked: false,
    design: {
      kind: "text",
      text: "Dr. A. Sharma",
      font: "var(--font-inter), sans-serif",
      colour: "#1f2a44",
    },
  },
  {
    id: "d6",
    name: "Botanical heart etching",
    source: "ai",
    detail: "vintage anatomical heart drawing",
    savedOn: "20 Jul",
    usedIn: 0,
    liked: false,
    design: { kind: "ai", prompt: "vintage anatomical heart", style: "Mandala", variant: 3 },
  },
  {
    id: "d7",
    name: "Workshop crest",
    source: "upload",
    detail: "makers-mark-v2.png",
    savedOn: "15 Jun",
    usedIn: 12,
    liked: false,
    design: { kind: "ai", prompt: "makers mark crest", style: "Streetwear", variant: 2 },
  },
  {
    id: "d8",
    name: "Wireframe future typo",
    source: "ai",
    detail: "bold helvetica wireframe globe",
    savedOn: "10 Jun",
    usedIn: 0,
    liked: false,
    design: { kind: "ai", prompt: "bold wireframe globe", style: "Typography", variant: 1 },
  },
];

export const wishlist = [
  { slug: "premium-polo", outOfStockSize: null },
  { slug: "fleece-hoodie", outOfStockSize: null },
  { slug: "dry-fit-jersey", outOfStockSize: "M" },
  { slug: "oversized-tee", outOfStockSize: null },
];

export const SOURCE_LABEL: Record<DesignSource, string> = {
  ai: "AI",
  upload: "Uploaded",
  text: "Text",
};

export type SavedAddress = {
  id: string;
  label: string;
  name: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  isDefault: boolean;
};

export const savedAddresses: SavedAddress[] = [
  {
    id: "ad1",
    label: "Home",
    name: "Arjun Sharma",
    line1: "402 Vasant Vihar",
    line2: "Gomti Nagar",
    city: "Lucknow",
    state: "Uttar Pradesh",
    pincode: "226010",
    phone: "+91 98765 43210",
    isDefault: true,
  },
  {
    id: "ad2",
    label: "Work",
    name: "Arjun Sharma",
    line1: "KGMU Trauma Centre",
    line2: "Shah Mina Road, Chowk",
    city: "Lucknow",
    state: "Uttar Pradesh",
    pincode: "226003",
    phone: "+91 98765 43210",
    isDefault: false,
  },
  {
    id: "ad3",
    label: "Parents",
    name: "Rajesh Sharma",
    line1: "Villa 42, Green Meadows",
    line2: "Wagholi",
    city: "Pune",
    state: "Maharashtra",
    pincode: "412207",
    phone: "+91 87654 32109",
    isDefault: false,
  },
];

export const SIZE_CATEGORIES = [
  { key: "tees", label: "T-shirts", saved: "M" },
  { key: "polo", label: "Polo t-shirts", saved: "M" },
  { key: "winter", label: "Hoodies and sweatshirts", saved: "L" },
  { key: "jersey", label: "Jerseys", saved: "M" },
  { key: "apron", label: "Doctor aprons", saved: "L" },
];

export const FITS = [
  { key: "slim", label: "Slim", note: "Closer to the body" },
  { key: "regular", label: "Regular", note: "Standard tailored fit" },
  { key: "oversized", label: "Oversized", note: "Loose and relaxed" },
];

export const SIZE_CHART = [
  { size: "S", chest: 96, length: 68, shoulder: 42 },
  { size: "M", chest: 101, length: 70, shoulder: 44 },
  { size: "L", chest: 106, length: 72, shoulder: 46 },
  { size: "XL", chest: 111, length: 74, shoulder: 48 },
  { size: "XXL", chest: 116, length: 76, shoulder: 50 },
];

const LADDER = ["S", "M", "L", "XL", "XXL"];

export function recommendSize(heightCm: number, weightKg: number, build: string): string {
  let i = weightKg < 55 ? 0 : weightKg < 66 ? 1 : weightKg < 79 ? 2 : weightKg < 91 ? 3 : 4;
  if (build === "Slim") i -= 1;
  if (build === "Broad") i += 1;
  if (heightCm >= 185) i += 1;
  if (heightCm > 0 && heightCm < 163) i -= 1;
  return LADDER[Math.max(0, Math.min(LADDER.length - 1, i))];
}

export type TicketStatus = "Agent replied" | "Open" | "Resolved";

export const tickets: {
  id: string;
  subject: string;
  order: string;
  opened: string;
  status: TicketStatus;
}[] = [
  {
    id: "TK-98234",
    subject: "Print colour looks lighter than the preview",
    order: "PE-24102",
    opened: "3 August 2026",
    status: "Agent replied",
  },
  {
    id: "TK-97110",
    subject: "Hoodie sleeve length runs short",
    order: "PE-23990",
    opened: "16 July 2026",
    status: "Open",
  },
  {
    id: "TK-95002",
    subject: "Invoice needed with GST number",
    order: "PE-23840",
    opened: "5 June 2026",
    status: "Resolved",
  },
];

export const TICKET_SUBJECTS = [
  "Print quality",
  "Sizing",
  "Delivery delay",
  "Refund status",
  "Bulk enquiry",
];

