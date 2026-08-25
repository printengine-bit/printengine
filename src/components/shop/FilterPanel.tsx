"use client";

import { useState } from "react";
import { COLOURS, SIZES, type Audience, type Method } from "@/lib/catalog";

export type Filters = {
  fits: string[];
  sizes: string[];
  colours: string[];
  methods: Method[];
  audiences: Audience[];
  maxPrice: number;
  onSale: boolean;
};

export const EMPTY: Filters = {
  fits: [],
  sizes: [],
  colours: [],
  methods: [],
  audiences: [],
  maxPrice: 2500,
  onSale: false,
};

function Group({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-line py-5">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-[11px] uppercase tracking-[0.12em] text-muted">{title}</span>
        <span className="text-[16px] leading-none text-muted" aria-hidden>
          {open ? "−" : "+"}
        </span>
      </button>
      {open && <div className="mt-4">{children}</div>}
    </div>
  );
}

function Check({
  label,
  count,
  checked,
  onChange,
}: {
  label: string;
  count?: number;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 py-1.5">
      <span
        className={
          "flex h-4 w-4 shrink-0 items-center justify-center border " +
          (checked ? "border-ink bg-ink" : "border-line bg-white")
        }
      >
        {checked && (
          <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" aria-hidden>
            <path d="M2 6l3 3 5-6" fill="none" stroke="#b8f20a" strokeWidth="2" />
          </svg>
        )}
      </span>
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      <span className="text-[14px]">{label}</span>
      {count !== undefined && <span className="ml-auto text-[13px] text-muted">({count})</span>}
    </label>
  );
}

export default function FilterPanel({
  filters,
  setFilters,
  fitOptions,
  counts,
}: {
  filters: Filters;
  setFilters: (f: Filters) => void;
  fitOptions: string[];
  counts: Record<string, number>;
}) {
  const toggle = <K extends keyof Filters>(key: K, value: string) => {
    const list = filters[key] as string[];
    const next = list.includes(value)
      ? list.filter((v) => v !== value)
      : [...list, value];
    setFilters({ ...filters, [key]: next });
  };

  return (
    <div>
      <Group title="Fit">
        {fitOptions.map((f) => (
          <Check
            key={f}
            label={f}
            count={counts[f]}
            checked={filters.fits.includes(f)}
            onChange={() => toggle("fits", f)}
          />
        ))}
      </Group>

      <Group title="Gender">
        {(["Men", "Women", "Kids"] as Audience[]).map((a) => (
          <Check
            key={a}
            label={a}
            count={counts[a]}
            checked={filters.audiences.includes(a)}
            onChange={() => toggle("audiences", a)}
          />
        ))}
      </Group>

      <Group title="Size">
        <div className="flex flex-wrap gap-2">
          {SIZES.map((s) => {
            const on = filters.sizes.includes(s);
            return (
              <button
                key={s}
                type="button"
                aria-pressed={on}
                onClick={() => toggle("sizes", s)}
                className={
                  "h-9 w-11 border text-[13px] transition-colors " +
                  (on ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink")
                }
              >
                {s}
              </button>
            );
          })}
        </div>
      </Group>

      <Group title="Colour">
        <div className="flex flex-wrap gap-2">
          {COLOURS.map((c) => {
            const on = filters.colours.includes(c.name);
            return (
              <button
                key={c.name}
                type="button"
                aria-pressed={on}
                aria-label={c.name}
                title={c.name}
                onClick={() => toggle("colours", c.name)}
                className={
                  "h-7 w-7 border-2 transition-all " +
                  (on ? "border-lime" : "border-line hover:border-muted")
                }
                style={{ backgroundColor: c.hex }}
              />
            );
          })}
        </div>
      </Group>

      <Group title="Decoration method">
        {(["Custom print", "Embroidery"] as Method[]).map((m) => (
          <Check
            key={m}
            label={m}
            count={counts[m]}
            checked={filters.methods.includes(m)}
            onChange={() => toggle("methods", m)}
          />
        ))}
      </Group>

      <Group title="Price">
        <input
          type="range"
          min={400}
          max={2500}
          step={50}
          value={filters.maxPrice}
          aria-label="Maximum price"
          onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
          className="w-full accent-ink"
        />
        <p className="mt-2 text-[13px] text-muted">
          Up to ₹{filters.maxPrice.toLocaleString("en-IN")}
        </p>
      </Group>

      <Group title="Offers" defaultOpen={false}>
        <Check
          label="On sale"
          checked={filters.onSale}
          onChange={() => setFilters({ ...filters, onSale: !filters.onSale })}
        />
      </Group>
    </div>
  );
}
