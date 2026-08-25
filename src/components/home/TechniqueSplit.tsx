import Image from "next/image";
import Link from "next/link";

const CARDS: {
  label: string;
  title: string;
  price: string;
  copy: string[];
  cta: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
  badge: string;
}[] = [
  {
    label: "Direct to garment",
    title: "Custom print",
    price: "From ₹149 per area",
    copy: [
      "Full-colour, photo-grade prints with no minimum order.",
      "Best for AI artwork, photographs and detailed illustration.",
    ],
    cta: "Explore printing",
    href: "/shop?method=Custom+print",
    imageSrc: "/home/technique-dtg-print.png",
    imageAlt: "Detailed direct-to-garment koi artwork printed into navy cotton fibres",
    badge: "Best for detailed artwork",
  },
  {
    label: "Industrial embroidery",
    title: "Embroidery",
    price: "From ₹249 per area",
    copy: [
      "Dense stitched thread that survives hundreds of washes.",
      "Best for names, initials, logos and corporate uniforms.",
    ],
    cta: "Explore embroidery",
    href: "/embroidery",
    imageSrc: "/home/technique-embroidery.png",
    imageAlt: "Detailed raised-thread mountain embroidery on a maroon sweatshirt",
    badge: "Best for logos and names",
  },
];

export default function TechniqueSplit() {
  return (
    <section className="section-pe" aria-labelledby="tech-heading">
      <div className="container-pe">
        <h2 id="tech-heading" className="text-h2">
          Technique matters
        </h2>
        <p className="mt-2 max-w-lg text-[15px] text-muted">
          Two ways to put your design on fabric. We will tell you which one suits your artwork.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {CARDS.map((c) => (
            <article key={c.title} className="border border-line">
              <div className="relative h-72 overflow-hidden bg-alt lg:h-[340px]">
                <Image
                  src={c.imageSrc}
                  alt={c.imageAlt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center transition-transform duration-700 hover:scale-[1.035]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/65 via-transparent to-transparent" />
                <span className="absolute bottom-5 left-5 border border-white/25 bg-ink/70 px-3 py-1.5 text-[10px] uppercase tracking-[0.1em] text-white backdrop-blur-sm">
                  {c.badge}
                </span>
              </div>
              <div className="p-6 lg:p-8">
                <p className="text-[11px] uppercase tracking-[0.14em] text-muted">{c.label}</p>
                <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-[22px] font-medium tracking-[-0.02em]">{c.title}</h3>
                  <p className="text-[14px] text-muted">{c.price}</p>
                </div>
                <ul className="mt-4 space-y-1.5">
                  {c.copy.map((line) => (
                    <li key={line} className="text-[14px] leading-relaxed text-muted">
                      {line}
                    </li>
                  ))}
                </ul>
                <Link
                  href={c.href}
                  className="mt-6 inline-flex h-11 items-center border border-ink px-6 text-btn text-ink transition-colors hover:bg-ink hover:text-white"
                >
                  {c.cta}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
