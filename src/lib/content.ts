export type ContentPage = {
  slug: string;
  title: string;
  intro: string;
  sections: { heading: string; body: string[] }[];
};

export const guides: ContentPage[] = [
  {
    slug: "print-areas",
    title: "Print areas guide",
    intro:
      "We print on four areas of every garment. Here is exactly how big each one is and what suits it.",
    sections: [
      {
        heading: "Front",
        body: [
          "The main panel, 30 by 40 cm. Best for a single hero graphic, or a smaller chest print placed in the upper third.",
          "Keep important detail at least 2 cm inside the safe area — fabric shifts slightly on the press.",
        ],
      },
      {
        heading: "Back",
        body: [
          "Slightly taller at 30 by 42 cm. Suits large artwork, band-style prints, and team names above numbers.",
        ],
      },
      {
        heading: "Left and right sleeve",
        body: [
          "9 by 11 cm each. Small marks only: logos, initials, a date, a squad number.",
          "On long-sleeve garments the sleeve print sits on the upper arm, not the forearm.",
        ],
      },
      {
        heading: "Pricing",
        body: [
          "Custom print is ₹149 per area. Embroidery is ₹249 per area. You can combine areas and methods on a single garment.",
        ],
      },
    ],
  },
  {
    slug: "artwork",
    title: "Artwork requirements",
    intro: "Get these right and your print comes out exactly as you approved it.",
    sections: [
      {
        heading: "Resolution",
        body: [
          "Upload artwork at 300 DPI at the size you want it printed. A 30 cm wide front print needs roughly 3500 pixels across.",
          "We check every file before printing and will contact you within 4 hours if the resolution is too low.",
        ],
      },
      {
        heading: "File types",
        body: [
          "PNG with a transparent background is ideal. SVG is best for logos and flat vector marks. JPG works but cannot carry transparency.",
          "Maximum file size is 15 MB.",
        ],
      },
      {
        heading: "Colour",
        body: [
          "Design in sRGB. Screens are backlit and fabric is not, so very bright neons print slightly duller than they appear.",
          "On dark garments we lay down a white underbase, which brings colours much closer to your file.",
        ],
      },
      {
        heading: "What we cannot print",
        body: [
          "Third-party logos, film and sports characters, and anything you do not hold the rights to. Our artwork check catches these before printing.",
        ],
      },
    ],
  },
  {
    slug: "fabric",
    title: "Fabric and ink guide",
    intro: "Which blank takes which decoration, and why it matters.",
    sections: [
      {
        heading: "Cotton",
        body: [
          "Combed and ring-spun cotton takes direct-to-garment ink best. Our tees, hoodies and sweatshirts are cotton or cotton-rich.",
        ],
      },
      {
        heading: "Polyester",
        body: [
          "Jerseys are polyester and are decorated by sublimation, which dyes the fibre itself. That gives edge-to-edge colour with no hand feel, but it only works on light polyester.",
        ],
      },
      {
        heading: "Poly-cotton",
        body: [
          "Doctor aprons are a poly-cotton blend built for hot hospital laundering. We embroider these rather than print them.",
        ],
      },
      {
        heading: "Inks",
        body: [
          "Water-based, skin-safe pigment inks, free of phthalates. Suitable for kidswear.",
        ],
      },
    ],
  },
  {
    slug: "embroidery",
    title: "Embroidery guide",
    intro: "Thread behaves nothing like ink. Here is what stitches well.",
    sections: [
      {
        heading: "What works",
        body: [
          "Text, initials, monograms, logos and flat vector shapes with clear edges.",
          "Minimum readable text height is about 5 mm. Below that, letters close up.",
        ],
      },
      {
        heading: "What does not",
        body: [
          "Photographs, gradients and fine detailed illustration cannot be stitched. If you upload artwork like that for embroidery, we will suggest printing instead.",
        ],
      },
      {
        heading: "Stitch count and pricing",
        body: [
          "Embroidery is ₹249 per area regardless of stitch count, up to 12,000 stitches. Larger back pieces are quoted separately.",
        ],
      },
      {
        heading: "Durability",
        body: [
          "Stitched thread outlasts print. A name on a doctor apron will survive hundreds of hot washes without fading.",
        ],
      },
    ],
  },
  {
    slug: "gst",
    title: "GST and invoicing",
    intro: "How tax and invoicing work on printengine orders.",
    sections: [
      {
        heading: "GST on apparel",
        body: [
          "Apparel priced under ₹1,000 attracts 5% GST. At ₹1,000 and above it is 12%. All prices shown on the site are inclusive of GST.",
        ],
      },
      {
        heading: "Invoices",
        body: [
          "A tax invoice is generated for every order and can be downloaded from your account as soon as the order is placed.",
        ],
      },
      {
        heading: "Business orders",
        body: [
          "Add your GSTIN at checkout or on a bulk enquiry and we will raise the invoice against your business so you can claim input credit.",
        ],
      },
    ],
  },
  {
    slug: "size-chart",
    title: "Size chart",
    intro: "All measurements in centimetres, taken flat across the garment.",
    sections: [
      {
        heading: "How to measure",
        body: [
          "Lay a t-shirt you already own flat. Measure the chest across, 2 cm below the armhole, and double it. Match that figure to the chest column below.",
        ],
      },
      {
        heading: "Chest, length and shoulder",
        body: [
          "S — 96, 68, 42",
          "M — 101, 70, 44",
          "L — 106, 72, 46",
          "XL — 111, 74, 48",
          "XXL — 116, 76, 50",
        ],
      },
      {
        heading: "Not sure?",
        body: [
          "Use the size recommender in your account. Enter height, weight and build, and we will suggest a size and remember it on every product page.",
        ],
      },
    ],
  },
  {
    slug: "wash-care",
    title: "Wash and care",
    intro: "Printed and embroidered garments last far longer with a little care.",
    sections: [
      {
        heading: "Washing",
        body: [
          "Machine wash cold at 30 degrees, inside out, with like colours. Do not bleach.",
          "Turning the garment inside out is the single most effective thing you can do to protect a print.",
        ],
      },
      {
        heading: "Drying",
        body: ["Tumble dry low or line dry in shade. Direct sunlight fades pigment over time."],
      },
      {
        heading: "Ironing",
        body: ["Iron inside out. Never iron directly over a print or embroidery."],
      },
    ],
  },
];

export const policies: ContentPage[] = [
  {
    slug: "shipping",
    title: "Shipping policy",
    intro:
      "Every item is made to order, so dispatch works a little differently from stocked retail.",
    sections: [
      {
        heading: "Dispatch",
        body: ["Orders are printed and dispatched within 48 hours of artwork approval."],
      },
      {
        heading: "Delivery",
        body: [
          "Standard delivery is free on orders above ₹999 and arrives in 4 to 7 days across India.",
          "Express delivery is ₹149 and arrives in 2 to 3 days in serviceable pincodes.",
        ],
      },
      {
        heading: "Tracking",
        body: [
          "You receive an AWB number by WhatsApp and email as soon as the parcel leaves us. Before that, the tracking page shows photos of your order being made.",
        ],
      },
    ],
  },
  {
    slug: "returns",
    title: "Returns and refunds",
    intro: "Custom goods work differently from stocked ones. Please read this before ordering.",
    sections: [
      {
        heading: "Custom items",
        body: [
          "Because every piece is printed or embroidered to your own design, we cannot accept returns for a change of mind. You confirm this at checkout before paying.",
        ],
      },
      {
        heading: "Print defects",
        body: [
          "If the print is misaligned, cracked, discoloured, or does not match the file you approved, we reprint it free of charge.",
          "Send a photo through the support page and we can approve the reprint straight away.",
        ],
      },
      {
        heading: "Size exchange",
        body: [
          "One free size exchange per order. We reprint your design on the new size at our cost. The original garment must be unworn and unwashed.",
        ],
      },
      {
        heading: "Refunds",
        body: [
          "Approved refunds return to the original payment method within 5 to 7 working days.",
        ],
      },
    ],
  },
  {
    slug: "privacy",
    title: "Privacy policy",
    intro: "What we collect, why, and what we do not do with it.",
    sections: [
      {
        heading: "What we collect",
        body: [
          "Your name, phone number, email and delivery addresses, your order history, and the designs you generate or upload.",
        ],
      },
      {
        heading: "Your designs",
        body: [
          "Designs you create are stored against your account so you can reorder them. We do not sell or license your artwork, and we do not use it in our own marketing without asking you first.",
        ],
      },
      {
        heading: "Payments",
        body: [
          "Card and UPI details are handled entirely by our payment gateway. We never see or store them.",
        ],
      },
      {
        heading: "Your rights",
        body: ["Write to us to export or delete your account data at any time."],
      },
    ],
  },
  {
    slug: "terms",
    title: "Terms of service",
    intro: "The agreement between you and printengine.",
    sections: [
      {
        heading: "Ordering",
        body: [
          "Placing an order is an offer to buy. The contract forms when we confirm the order and complete the artwork check.",
        ],
      },
      {
        heading: "Your artwork",
        body: [
          "You confirm that you own or are licensed to use any artwork you upload. We reject artwork that infringes third-party rights, and you indemnify us against claims arising from artwork you supply.",
        ],
      },
      {
        heading: "Our artwork check",
        body: [
          "We may contact you, or decline an order, if artwork is too low resolution to print well or breaches the above.",
        ],
      },
      {
        heading: "Pricing",
        body: [
          "Prices include GST. We may correct pricing errors before dispatch and will contact you if that affects your order.",
        ],
      },
    ],
  },
  {
    slug: "contact",
    title: "Contact us",
    intro: "The fastest way to reach us is WhatsApp. We usually reply within 2 hours.",
    sections: [
      {
        heading: "Support",
        body: [
          "Raise a ticket from your account, and attach a photo if it is about print quality — it lets us approve a reprint immediately.",
        ],
      },
      {
        heading: "WhatsApp",
        body: ["Use the support page for a live order so your message stays linked to the correct purchase."],
      },
      {
        heading: "Bulk and corporate",
        body: [
          "Use the bulk orders page for quantities of 10 or more. You get a dedicated manager and slab pricing.",
        ],
      },
      {
        heading: "Registered office",
        body: ["printengine, Lucknow, Uttar Pradesh, India. Verified business and tax details will be published before checkout goes live."],
      },
    ],
  },
  {
    slug: "about",
    title: "About us",
    intro: "We print clothing one piece at a time, to designs our customers make themselves.",
    sections: [
      {
        heading: "Why we exist",
        body: [
          "Custom printing in India has meant minimum orders, week-long turnarounds, and artwork sent over WhatsApp. We built printengine so one person can design one hoodie and receive it in a few days, at a finish that holds up.",
        ],
      },
      {
        heading: "How we work",
        body: [
          "Everything is made to order in our own facility. Nothing is held in printed stock, so nothing is wasted.",
        ],
      },
      {
        heading: "What we care about",
        body: [
          "A print that survives the wash, a size that fits, and telling you the truth about when your order will arrive.",
        ],
      },
    ],
  },
  {
    slug: "careers",
    title: "Careers",
    intro:
      "We are a small team in Lucknow building the production side and the product side together.",
    sections: [
      {
        heading: "Open roles",
        body: [
          "Print floor operator, artwork quality checker, and a front-end engineer. Write to us with what you have made.",
        ],
      },
      {
        heading: "How we hire",
        body: [
          "A conversation, a practical task paid at our day rate, and a decision within a week.",
        ],
      },
    ],
  },
];

export const findContent = (list: ContentPage[], slug: string) =>
  list.find((c) => c.slug === slug);
