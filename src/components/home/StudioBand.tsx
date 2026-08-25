"use client";

import Link from "next/link";
import { useState } from "react";
import DesignRender from "@/components/product/DesignRender";
import { GarmentPhoto } from "@/components/ui/ProductMedia";
import { AREAS, VIEWBOX, type AreaId, type Design } from "@/lib/design";

const STEPS = [
  { n: "01", title: "Describe your print", copy: "Type an idea or upload your own artwork." },
  { n: "02", title: "Pick your placement", copy: "Front, back, left sleeve or right sleeve." },
  { n: "03", title: "We print and ship", copy: "Made to order and dispatched in 48 hours." },
];

const DESIGNS: { label: string; design: Design }[] = [
  {
    label: "Porsche 911",
    design: {
      kind: "ai",
      prompt: "classic silver Porsche 911 with acid-lime cinematic lighting",
      style: "Automotive realism",
      variant: 0,
      url: "/artwork/showcase/porsche-911.png",
    },
  },
  {
    label: "Bengal tiger",
    design: {
      kind: "ai",
      prompt: "realistic Bengal tiger emerging through tropical leaves",
      style: "Wildlife realism",
      variant: 1,
      url: "/artwork/showcase/bengal-tiger.png",
    },
  },
  {
    label: "Deep space",
    design: {
      kind: "ai",
      prompt: "astronaut floating over a luminous Earth horizon",
      style: "Cinematic realism",
      variant: 2,
      url: "/artwork/showcase/astronaut.png",
    },
  },
  {
    label: "Koi & peonies",
    design: {
      kind: "ai",
      prompt: "realistic koi fish with splashing water and red peonies",
      style: "Japanese realism",
      variant: 3,
      url: "/artwork/showcase/koi-peonies.png",
    },
  },
];

const pct = (value: number, total: number) => `${(value / total) * 100}%`;

export default function StudioBand() {
  const [area, setArea] = useState<AreaId>("front");
  const [designIndex, setDesignIndex] = useState(0);
  const current = AREAS.find((item) => item.id === area)!;

  return (
    <section className="bg-ink text-white" aria-labelledby="studio-heading">
      <div className="container-pe py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.82fr)_minmax(520px,1.18fr)] lg:items-stretch lg:gap-16">
          <div className="flex flex-col justify-center">
            <p className="text-[12px] uppercase tracking-[0.14em] text-lime">AI design studio</p>
            <h2 id="studio-heading" className="mt-4 max-w-lg text-h2 lg:text-[38px]">
              See the idea on fabric before we print it
            </h2>
            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-white/65">
              Generate artwork, choose its position and preview it on the real garment—all before adding a size to your cart.
            </p>

            <ol className="mt-9 space-y-6">
              {STEPS.map((step) => (
                <li key={step.n} className="flex gap-5">
                  <span className="shrink-0 text-[13px] text-lime">{step.n}</span>
                  <div className="border-l border-white/15 pl-5">
                    <p className="text-[16px] font-medium">{step.title}</p>
                    <p className="mt-1 text-[14px] text-white/60">{step.copy}</p>
                  </div>
                </li>
              ))}
            </ol>

            <Link
              href="/studio"
              className="mt-9 inline-flex h-12 w-fit items-center bg-lime px-7 text-btn text-ink transition-opacity hover:opacity-90"
            >
              Try the design studio
            </Link>

            <dl className="mt-10 grid max-w-lg grid-cols-3 border-y border-white/12 py-5">
              <div>
                <dt className="text-[20px] font-medium text-lime">10</dt>
                <dd className="mt-1 text-[11px] text-white/50">Free generations</dd>
              </div>
              <div className="border-l border-white/12 pl-5">
                <dt className="text-[20px] font-medium text-lime">4</dt>
                <dd className="mt-1 text-[11px] text-white/50">Print areas</dd>
              </div>
              <div className="border-l border-white/12 pl-5">
                <dt className="text-[20px] font-medium text-lime">48h</dt>
                <dd className="mt-1 text-[11px] text-white/50">Dispatch target</dd>
              </div>
            </dl>
          </div>

          <div className="border border-white/15 bg-white/[0.035] p-5 sm:p-6">
            <div className="flex items-center justify-between border-b border-white/12 pb-4">
              <div>
                <p className="text-[13px]">Fleece hoodie</p>
                <p className="mt-0.5 text-[11px] text-white/45">Black · {current.label.toLowerCase()}</p>
              </div>
              <span className="bg-lime px-2 py-0.5 text-[11px] font-medium text-ink">Interactive preview</span>
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-[minmax(0,1fr)_150px]">
              <div className="relative aspect-[4/5] overflow-hidden bg-[#f7f5f2]">
                <GarmentPhoto
                  kind="hoodie"
                  area={area}
                  colour="#0a0a0a"
                  name="Fleece hoodie"
                  className="absolute inset-0 h-full w-full"
                />
                <div
                  className="absolute border border-dashed border-lime/75 p-0.5"
                  style={{
                    left: pct(current.x, VIEWBOX.w),
                    top: pct(current.y, VIEWBOX.h),
                    width: pct(current.w, VIEWBOX.w),
                    height: pct(current.h, VIEWBOX.h),
                  }}
                >
                  <DesignRender
                    design={DESIGNS[designIndex].design}
                    className="mix-blend-screen"
                  />
                </div>
                <span className="absolute bottom-3 left-3 bg-white/90 px-2 py-1 text-[10px] text-ink">
                  Printable area {current.size}
                </span>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.12em] text-white/40">Choose artwork</p>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-1">
                  {DESIGNS.map(({ label, design }, index) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setDesignIndex(index)}
                      aria-label={`Preview ${label} artwork`}
                      aria-pressed={designIndex === index}
                      className={
                        "relative aspect-square overflow-hidden border bg-black p-1.5 transition-colors " +
                        (designIndex === index ? "border-lime" : "border-white/12 hover:border-white/35")
                      }
                    >
                      <DesignRender design={design} />
                      <span className="absolute inset-x-0 bottom-0 bg-black/80 px-2 py-1.5 text-left text-[10px] text-white">
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-4 gap-2" role="tablist" aria-label="Preview print placement">
              {AREAS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={area === item.id}
                  onClick={() => setArea(item.id)}
                  className={
                    "min-w-0 border px-1 py-2 text-[11px] transition-colors sm:text-[12px] " +
                    (area === item.id
                      ? "border-lime bg-lime text-ink"
                      : "border-white/20 text-white/65 hover:border-white/45")
                  }
                >
                  {item.id === "left" ? "Left sleeve" : item.id === "right" ? "Right sleeve" : item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
