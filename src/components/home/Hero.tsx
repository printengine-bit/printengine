"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ProductCover } from "@/components/ui/ProductMedia";

type Slide = {
  eyebrow: string;
  title: string;
  copy: string;
  cta: string;
  href: string;
  imageSlug: string;
  imageName: string;
  badge: string;
};

const SLIDES: Slide[] = [
  {
    eyebrow: "Automatic offer — no code needed",
    title: "Buy 2. Save 10%.",
    copy: "Mix any two garments and get 10% off the garment subtotal automatically in your cart.",
    cta: "Shop the offer",
    href: "/shop",
    imageSlug: "classic-half-sleeve-tee",
    imageName: "Classic half sleeve t-shirt",
    badge: "10% off 2+ garments",
  },
  {
    eyebrow: "The heavyweight hoodie edit",
    title: "Warm layers. Better prices.",
    copy: "Premium brushed-fleece hoodies with up to 28% off, ready for custom print or embroidery.",
    cta: "Shop hoodies",
    href: "/shop/hoodies",
    imageSlug: "fleece-hoodie",
    imageName: "Fleece hoodie",
    badge: "Up to 28% off",
  },
  {
    eyebrow: "Teams, colleges and clinics",
    title: "Bulk from 10 pieces.",
    copy: "Mix sizes, add names and numbers, and get slab pricing with GST invoicing and production support.",
    cta: "Get a quote",
    href: "/bulk-orders",
    imageSlug: "dry-fit-jersey",
    imageName: "Dry-fit jersey",
    badge: "Bulk pricing from 10+",
  },
];

export default function Hero() {
  const [index, setIndex] = useState(0);
  const paused = useRef(false);
  const go = useCallback(
    (next: number) => setIndex(((next % SLIDES.length) + SLIDES.length) % SLIDES.length),
    []
  );

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      if (!paused.current) setIndex((current) => (current + 1) % SLIDES.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, []);

  const slide = SLIDES[index];

  return (
    <section
      className="relative overflow-hidden bg-ink text-white"
      aria-roledescription="carousel"
      aria-label="Featured promotions"
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
    >
      <div className="absolute inset-y-0 right-0 w-full sm:w-[58%]">
        <ProductCover
          slug={slide.imageSlug}
          name={slide.imageName}
          sizes="(max-width: 640px) 100vw, 58vw"
          className="object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/35 to-transparent sm:from-ink sm:via-ink/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent" />
        <p className="absolute bottom-6 right-6 border border-white/25 bg-ink/75 px-4 py-2 text-[11px] uppercase tracking-[0.12em] backdrop-blur-sm">
          {slide.badge}
        </p>
      </div>

      <div className="container-pe relative flex h-[500px] items-center lg:h-[600px]">
        <div className="max-w-[520px]">
          <p className="text-[12px] uppercase tracking-[0.14em] text-lime">{slide.eyebrow}</p>
          <h1 className="mt-4 text-h1m lg:text-h1">{slide.title}</h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/75">{slide.copy}</p>
          <Link
            href={slide.href}
            className="mt-8 inline-flex h-12 items-center bg-lime px-7 text-btn text-ink transition-opacity hover:opacity-90"
          >
            {slide.cta}
          </Link>
        </div>
      </div>

      <div className="container-pe relative flex items-center gap-2 pb-8">
        {SLIDES.map((item, itemIndex) => (
          <button
            key={item.title}
            type="button"
            onClick={() => go(itemIndex)}
            aria-label={`Go to slide ${itemIndex + 1}: ${item.title}`}
            aria-current={itemIndex === index}
            className={
              "h-[3px] transition-all " +
              (itemIndex === index ? "w-10 bg-lime" : "w-6 bg-white/25 hover:bg-white/50")
            }
          />
        ))}
      </div>
    </section>
  );
}
