"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DesignRender from "@/components/product/DesignRender";
import { Heart } from "@/components/ui/icons";
import { savedDesigns, SOURCE_LABEL, type DesignSource } from "@/lib/account";
import { readDesigns, updateDesigns, type StoredDesign } from "@/lib/designs-store";

const FILTERS = [
  { label: "All", value: "all" },
  { label: "Generated with AI", value: "ai" },
  { label: "Uploaded", value: "upload" },
  { label: "Text", value: "text" },
] as const;

export default function DesignsView() {
  const [filter, setFilter] = useState<string>("all");
  const [liked, setLiked] = useState<string[]>(
    savedDesigns.filter((d) => d.liked).map((d) => d.id)
  );
  const [menu, setMenu] = useState<string | null>(null);
  const [mine, setMine] = useState<StoredDesign[]>([]);

  // Designs you saved live in localStorage, readable only after mount.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const stored = readDesigns();
    setMine(stored);
    setLiked((prev) => [...prev, ...stored.filter((d) => d.liked).map((d) => d.id)]);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const remove = (id: string) => {
    const next = mine.filter((d) => d.id !== id);
    setMine(next);
    updateDesigns(next);
  };

  const all = [...mine, ...savedDesigns];
  const list = all.filter((d) => filter === "all" || d.source === filter);

  return (
    <>
      <div className="no-scrollbar flex gap-2 overflow-x-auto" role="group" aria-label="Filter designs">
        {FILTERS.map((f) => {
          const on = filter === f.value;
          return (
            <button
              key={f.value}
              type="button"
              aria-pressed={on}
              onClick={() => setFilter(f.value)}
              className={
                "shrink-0 border px-4 py-2 text-[13px] transition-colors " +
                (on ? "border-lime bg-lime text-ink" : "border-line bg-white hover:border-ink")
              }
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <p className="sr-only" aria-live="polite">
        {list.length} designs shown
      </p>

      {list.length === 0 ? (
        <div className="mt-8 border border-line px-6 py-16 text-center">
          <p className="text-[16px]">No designs of this type yet</p>
          <p className="mt-2 text-[14px] text-muted">
            Generate one in the studio or upload your own artwork.
          </p>
        </div>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4 lg:gap-6">
          {list.map((d) => {
            const isLiked = liked.includes(d.id);
            return (
              <li key={d.id}>
                <div className="relative aspect-square border border-line bg-alt p-5">
                  <span
                    className={
                      "absolute left-0 top-0 px-2 py-1 text-[11px] font-medium " +
                      (d.source === "ai"
                        ? "bg-lime text-ink"
                        : "border border-line bg-white text-ink")
                    }
                  >
                    {SOURCE_LABEL[d.source as DesignSource]}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setLiked((prev) =>
                        prev.includes(d.id) ? prev.filter((x) => x !== d.id) : [...prev, d.id]
                      )
                    }
                    aria-pressed={isLiked}
                    aria-label={isLiked ? `Unlike ${d.name}` : `Like ${d.name}`}
                    className={
                      "absolute right-2 top-2 p-1 transition-colors " +
                      (isLiked ? "text-[#5f7f06]" : "text-muted hover:text-ink")
                    }
                  >
                    <Heart className="h-5 w-5" />
                  </button>
                  <DesignRender design={d.design} />
                </div>

                <p className="mt-3 text-[15px] leading-snug">{d.name}</p>
                <p className="mt-1 truncate text-[12px] text-muted">
                  {d.source === "ai" ? `“${d.detail}”` : d.detail}
                </p>
                <p className="mt-1 text-[12px] text-muted">
                  Saved {d.savedOn} · used in {d.usedIn} {d.usedIn === 1 ? "order" : "orders"}
                </p>

                <div className="relative mt-3 flex items-center justify-between">
                  <Link href="/shop" className="text-[13px] underline underline-offset-4">
                    Use on a garment
                  </Link>
                  <button
                    type="button"
                    onClick={() => setMenu(menu === d.id ? null : d.id)}
                    aria-expanded={menu === d.id}
                    aria-label={`More actions for ${d.name}`}
                    className="px-2 text-[16px] leading-none text-muted hover:text-ink"
                  >
                    ⋯
                  </button>
                  {menu === d.id && (
                    <div className="absolute right-0 top-7 z-10 w-44 border border-line bg-white py-1">
                      {["Rename", "Download file", "Duplicate", "Delete"].map((a) => (
                        <button
                          key={a}
                          type="button"
                          onClick={() => {
                            if (a === "Delete" && mine.some((m) => m.id === d.id)) remove(d.id);
                            setMenu(null);
                          }}
                          className={
                            "block w-full px-4 py-2 text-left text-[13px] hover:bg-alt " +
                            (a === "Delete" ? "text-[#a32d2d]" : "")
                          }
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <section className="mt-10 flex flex-col gap-5 border border-line bg-alt p-6 sm:flex-row sm:items-center">
        <div className="flex-1">
          <h2 className="text-[16px] font-medium">Every design is print ready</h2>
          <p className="mt-1.5 max-w-xl text-[14px] leading-relaxed text-muted">
            We keep the high-resolution file behind every design, so reordering it on a different
            garment costs nothing extra.
          </p>
        </div>
        <Link
          href="/shop"
          className="flex h-11 shrink-0 items-center justify-center border border-ink px-6 text-btn transition-colors hover:bg-ink hover:text-white"
        >
          Open the design studio
        </Link>
      </section>
    </>
  );
}
