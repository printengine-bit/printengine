import type { GarmentKind } from "@/components/ui/Garment";

export type Audience = "Men" | "Women" | "Kids";
export type Method = "Custom print" | "Embroidery";
export type CategorySlug =
  | "t-shirts"
  | "hoodies"
  | "sweatshirts"
  | "jerseys"
  | "streetwear"
  | "sports"
  | "accessories"
  | "doctor-aprons";

export type Colour = { name: string; hex: string };

export const COLOURS: Colour[] = [
  { name: "Black", hex: "#0a0a0a" },
  { name: "White", hex: "#ffffff" },
  { name: "Navy", hex: "#1f2a44" },
  { name: "Grey melange", hex: "#9aa0a6" },
  { name: "Olive", hex: "#4b5320" },
  { name: "Maroon", hex: "#6b1f2a" },
  { name: "Bottle green", hex: "#14532d" },
  { name: "Mustard", hex: "#c8951a" },
  { name: "Off-white", hex: "#f2efe6" },
  { name: "Brown", hex: "#654236" },
  { name: "Charcoal", hex: "#333333" },
  { name: "Natural", hex: "#e7dfcf" },
];

export const SIZES = ["S", "M", "L", "XL", "XXL", "One size"] as const;
export type Size = (typeof SIZES)[number];

export type Product = {
  slug: string;
  name: string;
  subtitle: string;
  price: number;
  mrp: number;
  kind: GarmentKind;
  category: CategorySlug;
  audience: Audience[];
  fit: string;
  gsm: number;
  colours: string[];
  sizes: Size[];
  methods: Method[];
  stock?: number;
  bestseller?: boolean;
  isNew?: boolean;
};

const ALL: Size[] = ["S", "M", "L", "XL", "XXL"];

export const products: Product[] = [
  {
    slug: "classic-half-sleeve-tee",
    name: "Classic half sleeve t-shirt",
    subtitle: "180 gsm combed cotton",
    price: 599,
    mrp: 899,
    kind: "tee-half",
    category: "t-shirts",
    audience: ["Men", "Women", "Kids"],
    fit: "Regular",
    gsm: 180,
    colours: ["Black", "White", "Navy", "Grey melange", "Olive"],
    sizes: ALL,
    methods: ["Custom print"],
    bestseller: true,
  },
  {
    slug: "full-sleeve-tee",
    name: "Full sleeve t-shirt",
    subtitle: "190 gsm bio-washed cotton",
    price: 799,
    mrp: 1099,
    kind: "tee-full",
    category: "t-shirts",
    audience: ["Men", "Women"],
    fit: "Regular",
    gsm: 190,
    colours: ["Black", "White", "Navy", "Maroon"],
    sizes: ALL,
    methods: ["Custom print"],
  },
  {
    slug: "premium-polo",
    name: "Premium polo t-shirt",
    subtitle: "220 gsm pique knit",
    price: 899,
    mrp: 1299,
    kind: "polo",
    category: "t-shirts",
    audience: ["Men", "Women"],
    fit: "Regular",
    gsm: 220,
    colours: ["Black", "White", "Navy", "Bottle green", "Maroon"],
    sizes: ALL,
    methods: ["Custom print", "Embroidery"],
    bestseller: true,
  },
  {
    slug: "oversized-tee",
    name: "Oversized t-shirt",
    subtitle: "240 gsm drop shoulder",
    price: 749,
    mrp: 999,
    kind: "oversized",
    category: "t-shirts",
    audience: ["Men", "Women"],
    fit: "Oversized",
    gsm: 240,
    colours: ["Black", "White", "Olive", "Mustard"],
    sizes: ALL,
    methods: ["Custom print"],
    isNew: true,
  },
  {
    slug: "heavyweight-boxy-tee",
    name: "Heavyweight boxy t-shirt",
    subtitle: "260 gsm ring spun cotton",
    price: 899,
    mrp: 1199,
    kind: "oversized",
    category: "t-shirts",
    audience: ["Men", "Women"],
    fit: "Oversized",
    gsm: 260,
    colours: ["Black", "Grey melange", "Bottle green"],
    sizes: ["M", "L", "XL", "XXL"],
    methods: ["Custom print", "Embroidery"],
    stock: 3,
  },
  {
    slug: "dry-fit-round-neck",
    name: "Dry-fit round neck t-shirt",
    subtitle: "160 gsm polyester mesh",
    price: 649,
    mrp: 899,
    kind: "tee-half",
    category: "t-shirts",
    audience: ["Men", "Women", "Kids"],
    fit: "Athletic",
    gsm: 160,
    colours: ["Black", "Navy", "Bottle green", "Mustard"],
    sizes: ALL,
    methods: ["Custom print"],
  },
  {
    slug: "kids-half-sleeve-tee",
    name: "Kids half sleeve t-shirt",
    subtitle: "170 gsm soft cotton",
    price: 449,
    mrp: 649,
    kind: "tee-half",
    category: "t-shirts",
    audience: ["Kids"],
    fit: "Regular",
    gsm: 170,
    colours: ["White", "Navy", "Mustard", "Maroon"],
    sizes: ["S", "M", "L"],
    methods: ["Custom print"],
  },
  {
    slug: "long-sleeve-henley",
    name: "Long sleeve henley",
    subtitle: "200 gsm slub cotton",
    price: 949,
    mrp: 1299,
    kind: "henley",
    category: "t-shirts",
    audience: ["Men"],
    fit: "Slim",
    gsm: 200,
    colours: ["Black", "Olive", "Grey melange"],
    sizes: ["M", "L", "XL"],
    methods: ["Custom print", "Embroidery"],
    stock: 1,
  },

  {
    slug: "fleece-hoodie",
    name: "Fleece hoodie",
    subtitle: "380 gsm brushed fleece",
    price: 1299,
    mrp: 1799,
    kind: "hoodie",
    category: "hoodies",
    audience: ["Men", "Women", "Kids"],
    fit: "Regular",
    gsm: 380,
    colours: ["Black", "Navy", "Olive", "Maroon", "Grey melange"],
    sizes: ALL,
    methods: ["Custom print", "Embroidery"],
    bestseller: true,
  },
  {
    slug: "zipper-hoodie",
    name: "Zipper hoodie",
    subtitle: "360 gsm fleece, metal zip",
    price: 1449,
    mrp: 1999,
    kind: "hoodie",
    category: "hoodies",
    audience: ["Men", "Women"],
    fit: "Regular",
    gsm: 360,
    colours: ["Black", "Navy", "Grey melange"],
    sizes: ALL,
    methods: ["Embroidery"],
  },
  {
    slug: "oversized-hoodie",
    name: "Oversized hoodie",
    subtitle: "400 gsm drop shoulder",
    price: 1599,
    mrp: 2199,
    kind: "hoodie",
    category: "hoodies",
    audience: ["Men", "Women"],
    fit: "Oversized",
    gsm: 400,
    colours: ["Black", "Olive", "Bottle green"],
    sizes: ["M", "L", "XL", "XXL"],
    methods: ["Custom print", "Embroidery"],
    isNew: true,
  },

  {
    slug: "crew-sweatshirt",
    name: "Crew neck sweatshirt",
    subtitle: "320 gsm loop knit",
    price: 1099,
    mrp: 1499,
    kind: "sweatshirt",
    category: "sweatshirts",
    audience: ["Men", "Women", "Kids"],
    fit: "Regular",
    gsm: 320,
    colours: ["Black", "White", "Navy", "Grey melange", "Maroon"],
    sizes: ALL,
    methods: ["Custom print", "Embroidery"],
  },
  {
    slug: "oversized-sweatshirt",
    name: "Oversized sweatshirt",
    subtitle: "340 gsm brushed inner",
    price: 1249,
    mrp: 1699,
    kind: "sweatshirt",
    category: "sweatshirts",
    audience: ["Men", "Women"],
    fit: "Oversized",
    gsm: 340,
    colours: ["Black", "Olive", "Mustard"],
    sizes: ["M", "L", "XL", "XXL"],
    methods: ["Custom print"],
    stock: 2,
  },

  {
    slug: "dry-fit-jersey",
    name: "Dry-fit jersey",
    subtitle: "Sublimation ready polyester",
    price: 749,
    mrp: 999,
    kind: "jersey",
    category: "jerseys",
    audience: ["Men", "Women", "Kids"],
    fit: "Athletic",
    gsm: 150,
    colours: ["Black", "Navy", "Bottle green", "Maroon", "Mustard"],
    sizes: ALL,
    methods: ["Custom print"],
    bestseller: true,
  },
  {
    slug: "cricket-jersey",
    name: "Cricket jersey",
    subtitle: "Full sublimation, name and number",
    price: 899,
    mrp: 1249,
    kind: "jersey",
    category: "jerseys",
    audience: ["Men", "Women", "Kids"],
    fit: "Athletic",
    gsm: 155,
    colours: ["Navy", "Bottle green", "Maroon"],
    sizes: ALL,
    methods: ["Custom print"],
  },
  {
    slug: "football-jersey",
    name: "Football jersey",
    subtitle: "Lightweight breathable mesh",
    price: 849,
    mrp: 1199,
    kind: "jersey",
    category: "jerseys",
    audience: ["Men", "Kids"],
    fit: "Athletic",
    gsm: 140,
    colours: ["Black", "Navy", "Mustard"],
    sizes: ALL,
    methods: ["Custom print"],
    isNew: true,
  },

  {
    slug: "doctor-apron",
    name: "Doctor apron",
    subtitle: "Poly-cotton, name embroidery",
    price: 1199,
    mrp: 1599,
    kind: "apron",
    category: "doctor-aprons",
    audience: ["Men", "Women"],
    fit: "Regular",
    gsm: 210,
    colours: ["White"],
    sizes: ALL,
    methods: ["Embroidery"],
  },
  {
    slug: "half-sleeve-apron",
    name: "Half sleeve doctor apron",
    subtitle: "Wrinkle-resistant blend",
    price: 1049,
    mrp: 1449,
    kind: "apron",
    category: "doctor-aprons",
    audience: ["Men", "Women"],
    fit: "Regular",
    gsm: 200,
    colours: ["White"],
    sizes: ["S", "M", "L", "XL"],
    methods: ["Embroidery"],
    stock: 4,
  },
  {
    slug: "oversized-black",
    name: "Oversized Black t-shirt",
    subtitle: "240 gsm premium combed cotton",
    price: 799, mrp: 1099, kind: "oversized", category: "t-shirts",
    audience: ["Men", "Women"], fit: "Oversized", gsm: 240,
    colours: ["Black"], sizes: ALL, methods: ["Custom print"], isNew: true,
  },
  {
    slug: "oversized-off-white",
    name: "Oversized Off-white t-shirt",
    subtitle: "240 gsm premium combed cotton",
    price: 799, mrp: 1099, kind: "oversized", category: "t-shirts",
    audience: ["Men", "Women"], fit: "Oversized", gsm: 240,
    colours: ["Off-white"], sizes: ALL, methods: ["Custom print"], isNew: true,
  },
  {
    slug: "oversized-grey",
    name: "Oversized Grey t-shirt",
    subtitle: "240 gsm premium combed cotton",
    price: 799, mrp: 1099, kind: "oversized", category: "t-shirts",
    audience: ["Men", "Women"], fit: "Oversized", gsm: 240,
    colours: ["Grey melange"], sizes: ALL, methods: ["Custom print"], isNew: true,
  },
  {
    slug: "oversized-olive",
    name: "Oversized Olive t-shirt",
    subtitle: "240 gsm premium combed cotton",
    price: 799, mrp: 1099, kind: "oversized", category: "t-shirts",
    audience: ["Men", "Women"], fit: "Oversized", gsm: 240,
    colours: ["Olive"], sizes: ALL, methods: ["Custom print"], isNew: true,
  },
  {
    slug: "oversized-brown",
    name: "Oversized Brown t-shirt",
    subtitle: "240 gsm premium combed cotton",
    price: 849, mrp: 1149, kind: "oversized", category: "t-shirts",
    audience: ["Men", "Women"], fit: "Oversized", gsm: 240,
    colours: ["Brown"], sizes: ALL, methods: ["Custom print"], isNew: true,
  },
  {
    slug: "oversized-navy",
    name: "Oversized Navy t-shirt",
    subtitle: "240 gsm premium combed cotton",
    price: 799, mrp: 1099, kind: "oversized", category: "t-shirts",
    audience: ["Men", "Women"], fit: "Oversized", gsm: 240,
    colours: ["Navy"], sizes: ALL, methods: ["Custom print"], isNew: true,
  },
  {
    slug: "vintage-washed-tee",
    name: "Vintage Washed t-shirt",
    subtitle: "260 gsm mineral-washed cotton",
    price: 999, mrp: 1399, kind: "oversized", category: "t-shirts",
    audience: ["Men", "Women"], fit: "Oversized", gsm: 260,
    colours: ["Charcoal"], sizes: ALL, methods: ["Custom print"], bestseller: true,
  },
  {
    slug: "minimal-logo-tee",
    name: "Minimal Logo Tee",
    subtitle: "200 gsm compact cotton, chest mark",
    price: 749, mrp: 999, kind: "tee-half", category: "t-shirts",
    audience: ["Men", "Women"], fit: "Regular", gsm: 200,
    colours: ["Navy"], sizes: ALL, methods: ["Custom print"], isNew: true,
  },
  {
    slug: "streetwear-oversized-hoodie",
    name: "Oversized hoodie",
    subtitle: "420 gsm heavyweight brushed fleece",
    price: 1699, mrp: 2299, kind: "hoodie", category: "streetwear",
    audience: ["Men", "Women"], fit: "Oversized", gsm: 420,
    colours: ["Bottle green", "Black", "Olive"], sizes: ALL,
    methods: ["Custom print", "Embroidery"], bestseller: true,
  },
  {
    slug: "boxy-sweatshirt",
    name: "Boxy sweatshirt",
    subtitle: "360 gsm structured loopback cotton",
    price: 1399, mrp: 1899, kind: "sweatshirt", category: "streetwear",
    audience: ["Men", "Women"], fit: "Boxy", gsm: 360,
    colours: ["Mustard", "Black", "Olive", "Grey melange"], sizes: ALL,
    methods: ["Custom print", "Embroidery"], isNew: true,
  },
  {
    slug: "cargo-pants",
    name: "Cargo pants",
    subtitle: "Relaxed utility twill with six pockets",
    price: 1499, mrp: 1999, kind: "cargo", category: "streetwear",
    audience: ["Men", "Women"], fit: "Relaxed", gsm: 280,
    colours: ["Olive"], sizes: ALL, methods: ["Embroidery"], isNew: true,
  },
  {
    slug: "varsity-jacket",
    name: "Varsity jacket",
    subtitle: "Wool-touch body with contrast sleeves",
    price: 2499, mrp: 3299, kind: "varsity", category: "streetwear",
    audience: ["Men", "Women"], fit: "Regular", gsm: 420,
    colours: ["Black"], sizes: ALL, methods: ["Embroidery"], isNew: true,
  },
  {
    slug: "pro-football-jersey",
    name: "Football jersey",
    subtitle: "140 gsm breathable match mesh",
    price: 899, mrp: 1199, kind: "jersey", category: "sports",
    audience: ["Men", "Women", "Kids"], fit: "Athletic", gsm: 140,
    colours: ["Navy", "Black", "Mustard"], sizes: ALL, methods: ["Custom print"],
  },
  {
    slug: "basketball-jersey",
    name: "Basketball jersey",
    subtitle: "Breathable mesh jersey and shorts set",
    price: 1099, mrp: 1499, kind: "basketball", category: "sports",
    audience: ["Men", "Women", "Kids"], fit: "Athletic", gsm: 150,
    colours: ["Navy"], sizes: ALL, methods: ["Custom print"], isNew: true,
  },
  {
    slug: "oversized-sports-tee",
    name: "Oversized sports tee",
    subtitle: "180 gsm quick-dry performance knit",
    price: 849, mrp: 1149, kind: "oversized", category: "sports",
    audience: ["Men", "Women"], fit: "Oversized", gsm: 180,
    colours: ["Olive", "Black", "Navy"], sizes: ALL, methods: ["Custom print"],
  },
  {
    slug: "dry-fit-gym-tee",
    name: "Dry-fit gym tee",
    subtitle: "160 gsm moisture-wicking performance mesh",
    price: 699, mrp: 949, kind: "tee-half", category: "sports",
    audience: ["Men", "Women"], fit: "Athletic", gsm: 160,
    colours: ["Navy", "Black", "Bottle green"], sizes: ALL, methods: ["Custom print"],
  },
  {
    slug: "premium-cap",
    name: "Premium cap",
    subtitle: "Six-panel cotton cap with adjustable strap",
    price: 499, mrp: 699, kind: "cap", category: "accessories",
    audience: ["Men", "Women"], fit: "Adjustable", gsm: 0,
    colours: ["Black"], sizes: ["One size"], methods: ["Embroidery"], isNew: true,
  },
  {
    slug: "tote-bag",
    name: "Tote bag",
    subtitle: "Heavy natural canvas with reinforced handles",
    price: 449, mrp: 649, kind: "tote", category: "accessories",
    audience: ["Men", "Women"], fit: "One size", gsm: 320,
    colours: ["Natural"], sizes: ["One size"], methods: ["Custom print", "Embroidery"],
  },
  {
    slug: "crossbody-bag",
    name: "Sling / crossbody bag",
    subtitle: "Water-resistant compact everyday bag",
    price: 799, mrp: 1099, kind: "sling", category: "accessories",
    audience: ["Men", "Women"], fit: "Adjustable", gsm: 0,
    colours: ["Black"], sizes: ["One size"], methods: ["Custom print", "Embroidery"],
  },
  {
    slug: "crew-socks",
    name: "Crew socks",
    subtitle: "Cushioned combed-cotton crew socks",
    price: 299, mrp: 449, kind: "socks", category: "accessories",
    audience: ["Men", "Women"], fit: "Stretch", gsm: 0,
    colours: ["White"], sizes: ["M", "L"], methods: ["Embroidery"],
  },
  {
    slug: "piped-medical-tunic",
    name: "Piped medical tunic",
    subtitle: "Short-sleeve poly-cotton tunic with navy piping",
    price: 899, mrp: 1199, kind: "medical-tunic", category: "doctor-aprons",
    audience: ["Men"], fit: "Regular", gsm: 190,
    colours: ["White"], sizes: ALL, methods: ["Embroidery"], isNew: true,
  },
  {
    slug: "side-button-medical-tunic",
    name: "Side-button medical tunic",
    subtitle: "Asymmetric nurse tunic with contrast piping",
    price: 999, mrp: 1349, kind: "medical-wrap-tunic", category: "doctor-aprons",
    audience: ["Women"], fit: "Regular", gsm: 190,
    colours: ["White"], sizes: ALL, methods: ["Embroidery"], isNew: true,
  },
  {
    slug: "mens-short-lab-coat",
    name: "Men's short lab coat",
    subtitle: "Short-sleeve three-pocket clinical coat",
    price: 1049, mrp: 1399, kind: "mens-short-lab-coat", category: "doctor-aprons",
    audience: ["Men"], fit: "Regular", gsm: 200,
    colours: ["White"], sizes: ALL, methods: ["Embroidery"],
  },
  {
    slug: "womens-short-lab-coat",
    name: "Women's short lab coat",
    subtitle: "Tailored short coat with two patch pockets",
    price: 1049, mrp: 1399, kind: "womens-short-lab-coat", category: "doctor-aprons",
    audience: ["Women"], fit: "Regular", gsm: 200,
    colours: ["White"], sizes: ALL, methods: ["Embroidery"],
  },
  {
    slug: "maroon-scrub-set",
    name: "Maroon scrub set",
    subtitle: "V-neck scrub top with straight-leg trousers",
    price: 1399, mrp: 1899, kind: "scrub-set", category: "doctor-aprons",
    audience: ["Men", "Women"], fit: "Regular", gsm: 180,
    colours: ["Maroon"], sizes: ALL, methods: ["Embroidery"], bestseller: true,
  },
];

export const categories: {
  slug: CategorySlug;
  name: string;
  subtitle: string;
  kind: GarmentKind;
  blurb: string;
}[] = [
  {
    slug: "t-shirts",
    name: "T-shirts",
    subtitle: "Half, full and polo",
    kind: "tee-half",
    blurb:
      "Our t-shirts are chosen for one job: holding a print without fighting it. Combed and ring-spun cotton, preshrunk and bio-washed, with reinforced shoulder seams and twin-needle stitching so your design stays sharp wash after wash.",
  },
  {
    slug: "hoodies",
    name: "Hoodies",
    subtitle: "320–380 gsm",
    kind: "hoodie",
    blurb:
      "Brushed fleece with enough weight to carry a large back print or dense chest embroidery. Every hoodie is preshrunk, so the artwork you approve is the artwork that arrives.",
  },
  {
    slug: "sweatshirts",
    name: "Sweatshirts",
    subtitle: "Crew neck",
    kind: "sweatshirt",
    blurb:
      "Loop-knit crew necks with ribbed cuffs and hem. A flatter, smoother surface than fleece, which makes them the easier canvas for detailed multi-colour prints.",
  },
  {
    slug: "jerseys",
    name: "Jerseys",
    subtitle: "Dry-fit sublimation",
    kind: "jersey",
    blurb:
      "Polyester built for full-surface sublimation, which means edge-to-edge colour with no hand feel. The right pick for team kits with names, numbers and sponsor panels.",
  },
  {
    slug: "streetwear",
    name: "Streetwear",
    subtitle: "Heavyweight relaxed essentials",
    kind: "varsity",
    blurb:
      "Structured, oversized staples made for bold placements and durable embroidery: heavyweight hoodies, boxy sweats, cargo trousers and varsity jackets.",
  },
  {
    slug: "sports",
    name: "Sports",
    subtitle: "Team and training kits",
    kind: "basketball",
    blurb:
      "Breathable performance fabrics for match day and training, ready for team colours, player names, numbers and sponsor artwork.",
  },
  {
    slug: "accessories",
    name: "Accessories",
    subtitle: "Caps, bags and socks",
    kind: "cap",
    blurb:
      "Useful everyday pieces with clean decoration areas for embroidered marks, small logos and durable custom prints.",
  },
  {
    slug: "doctor-aprons",
    name: "Medical uniforms",
    subtitle: "Coats, tunics and scrubs",
    kind: "apron",
    blurb:
      "Poly-cotton coats built for daily hospital laundering. We embroider names, designations and clinic logos in thread that survives hundreds of hot washes.",
  },
];

export type MegaLink = { label: string; href: string };

export const megaMenu: Record<string, { heading: string; links: MegaLink[] }[]> = {
  Men: [
    { heading: "T-shirts", links: [
      { label: "Half sleeve tee", href: "/product/classic-half-sleeve-tee" },
      { label: "Full sleeve tee", href: "/product/full-sleeve-tee" },
      { label: "Polo t-shirt", href: "/product/premium-polo" },
      { label: "All t-shirts", href: "/shop/t-shirts?gender=Men" },
    ] },
    { heading: "Winterwear", links: [
      { label: "Hoodie", href: "/product/fleece-hoodie" },
      { label: "Sweatshirt", href: "/product/crew-sweatshirt" },
      { label: "All winterwear", href: "/shop/hoodies?gender=Men" },
    ] },
    { heading: "Sportswear", links: [
      { label: "Dry-fit jersey", href: "/product/dry-fit-jersey" },
      { label: "Team kits", href: "/bulk-orders" },
      { label: "All jerseys", href: "/shop/jerseys?gender=Men" },
    ] },
    { heading: "Workwear", links: [
      { label: "Doctor apron", href: "/product/doctor-apron" },
      { label: "Corporate polo", href: "/bulk-orders" },
      { label: "All aprons", href: "/shop/doctor-aprons?gender=Men" },
    ] },
  ],
  Women: [
    { heading: "T-shirts", links: [
      { label: "Half sleeve tee", href: "/product/classic-half-sleeve-tee" },
      { label: "Full sleeve tee", href: "/product/full-sleeve-tee" },
      { label: "Polo t-shirt", href: "/product/premium-polo" },
      { label: "All t-shirts", href: "/shop/t-shirts?gender=Women" },
    ] },
    { heading: "Winterwear", links: [
      { label: "Hoodie", href: "/product/fleece-hoodie" },
      { label: "Sweatshirt", href: "/product/crew-sweatshirt" },
      { label: "All winterwear", href: "/shop/hoodies?gender=Women" },
    ] },
    { heading: "Sportswear", links: [
      { label: "Dry-fit jersey", href: "/product/dry-fit-jersey" },
      { label: "Team kits", href: "/bulk-orders" },
      { label: "All jerseys", href: "/shop/jerseys?gender=Women" },
    ] },
    { heading: "Workwear", links: [
      { label: "Doctor apron", href: "/product/doctor-apron" },
      { label: "Corporate polo", href: "/bulk-orders" },
      { label: "All aprons", href: "/shop/doctor-aprons?gender=Women" },
    ] },
  ],
  Kids: [
    { heading: "T-shirts", links: [
      { label: "Half sleeve tee", href: "/product/kids-half-sleeve-tee" },
      { label: "All t-shirts", href: "/shop/t-shirts?gender=Kids" },
    ] },
    { heading: "Winterwear", links: [
      { label: "Hoodie", href: "/product/fleece-hoodie" },
      { label: "Sweatshirt", href: "/product/crew-sweatshirt" },
      { label: "All winterwear", href: "/shop/hoodies?gender=Kids" },
    ] },
    { heading: "Sportswear", links: [
      { label: "Dry-fit jersey", href: "/product/dry-fit-jersey" },
      { label: "School kits", href: "/bulk-orders" },
      { label: "All jerseys", href: "/shop/jerseys?gender=Kids" },
    ] },
    { heading: "Shop by size", links: [
      { label: "Size S", href: "/shop?gender=Kids&size=S" },
      { label: "Size M", href: "/shop?gender=Kids&size=M" },
      { label: "Size L", href: "/shop?gender=Kids&size=L" },
    ] },
  ],
  "Design studio": [
    { heading: "Create", links: [
      { label: "AI design studio", href: "/studio" },
      { label: "Upload your artwork", href: "/studio?tab=upload" },
      { label: "Add name and number", href: "/studio?tab=text" },
      { label: "Saved designs", href: "/account/designs" },
    ] },
    { heading: "Learn", links: [
      { label: "Print areas guide", href: "/guides/print-areas" },
      { label: "Artwork requirements", href: "/guides/artwork" },
      { label: "Fabric and ink guide", href: "/guides/fabric" },
    ] },
    { heading: "Print areas", links: [
      { label: "Front", href: "/guides/print-areas" },
      { label: "Back", href: "/guides/print-areas" },
      { label: "Left sleeve", href: "/guides/print-areas" },
      { label: "Right sleeve", href: "/guides/print-areas" },
    ] },
    { heading: "Popular", links: [
      { label: "Trending prints", href: "/studio" },
      { label: "Bestsellers", href: "/shop?sort=Popularity" },
    ] },
  ],
  Embroidery: [
    { heading: "Embroidery on", links: [
      { label: "Polo t-shirt", href: "/product/premium-polo" },
      { label: "Hoodie", href: "/product/fleece-hoodie" },
      { label: "Doctor apron", href: "/product/doctor-apron" },
      { label: "All embroidery", href: "/shop?method=Embroidery" },
    ] },
    { heading: "Types", links: [
      { label: "Name and initials", href: "/embroidery" },
      { label: "Logo embroidery", href: "/embroidery" },
      { label: "Puff embroidery", href: "/embroidery" },
    ] },
    { heading: "Guides", links: [
      { label: "Thread colour chart", href: "/guides/embroidery" },
      { label: "Stitch count and pricing", href: "/guides/embroidery" },
    ] },
    { heading: "For teams", links: [
      { label: "Clinic and hospital kits", href: "/bulk-orders" },
      { label: "Corporate uniforms", href: "/bulk-orders" },
    ] },
  ],
  "Bulk orders": [
    { heading: "Get started", links: [
      { label: "Request a quote", href: "/bulk-orders" },
      { label: "Slab pricing", href: "/bulk-orders" },
    ] },
    { heading: "Segments", links: [
      { label: "Corporate", href: "/bulk-orders" },
      { label: "Colleges and fests", href: "/bulk-orders" },
      { label: "Sports teams", href: "/bulk-orders" },
      { label: "Clinics", href: "/bulk-orders" },
    ] },
    { heading: "Support", links: [
      { label: "GST invoicing", href: "/guides/gst" },
      { label: "Sampling", href: "/bulk-orders" },
    ] },
    { heading: "Timelines", links: [
      { label: "10 to 49 pieces", href: "/bulk-orders" },
      { label: "50 to 199 pieces", href: "/bulk-orders" },
      { label: "200 or more", href: "/bulk-orders" },
    ] },
  ],
};

export const reviews = [
  {
    quote:
      "Generated the print in under a minute and the stitch detail on the hoodie is genuinely premium. Nothing like the local printers.",
    name: "Ananya Iyer",
    city: "Bengaluru",
    kind: "hoodie" as GarmentKind,
  },
  {
    quote:
      "Ordered eleven jerseys with names and numbers for our team. One link, everyone picked their size, delivered in five days.",
    name: "Rohan Malhotra",
    city: "Pune",
    kind: "jersey" as GarmentKind,
  },
  {
    quote:
      "The embroidered name on my apron has survived thirty hospital washes without a thread out of place.",
    name: "Dr. Sneha Kulkarni",
    city: "Lucknow",
    kind: "apron" as GarmentKind,
  },
];

export const inr = (n: number) => "₹" + n.toLocaleString("en-IN");

export const hexFor = (name: string) =>
  COLOURS.find((c) => c.name === name)?.hex ?? "#cccccc";
