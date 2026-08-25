"use client";

import { useEffect, useState } from "react";
import { FITS, recommendSize, SIZE_CATEGORIES, SIZE_CHART } from "@/lib/account";
import { readSizeProfile, writeSizeProfile, type SizeProfile } from "@/lib/profile";

const SIZES = ["S", "M", "L", "XL", "XXL"];
const BUILDS = ["Slim", "Regular", "Broad"];

export default function SizeProfileView() {
  const [height, setHeight] = useState("178");
  const [weight, setWeight] = useState("74");
  const [build, setBuild] = useState("Regular");
  const [unit, setUnit] = useState<"cm" | "ft">("cm");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [sizes, setSizes] = useState<Record<string, string>>(
    Object.fromEntries(SIZE_CATEGORIES.map((c) => [c.key, c.saved]))
  );
  const [fit, setFit] = useState("regular");

  // Saved preferences live in localStorage, which is unavailable during SSR.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const stored = readSizeProfile();
    if (!stored) return;
    setSizes({
      tees: stored.tees,
      polo: stored.polo,
      winter: stored.winter,
      jersey: stored.jersey,
      apron: stored.apron,
    });
    setFit(stored.fit);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */
  const [dismissed, setDismissed] = useState(false);
  const [saved, setSaved] = useState(false);

  const recommend = () => {
    const h = Number(height);
    const w = Number(weight);
    if (!h || !w || h < 100 || h > 230 || w < 25 || w > 200) {
      setError("Enter a realistic height and weight.");
      setResult(null);
      return;
    }
    setError(null);
    setResult(recommendSize(unit === "cm" ? h : h * 30.48, w, build));
  };

  return (
    <>
      {!dismissed && (
        <div className="mb-7 flex items-start gap-3 border border-line bg-alt p-4">
          <svg
            viewBox="0 0 24 24"
            className="mt-0.5 h-5 w-5 shrink-0 text-muted"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 11v5M12 7.5v.5" />
          </svg>
          <p className="flex-1 text-[14px] leading-relaxed">
            You exchanged one order for a larger size in July. We have adjusted your hoodie
            recommendation to L.
          </p>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="shrink-0 text-[13px] text-muted underline underline-offset-4 hover:text-ink"
          >
            Dismiss
          </button>
        </div>
      )}

      <section className="border border-line bg-alt p-5 lg:p-6">
        <h2 className="text-[16px] font-medium">Find my size</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="mb-2 block text-[13px] text-muted">Height</span>
            <div className="flex">
              <input
                inputMode="decimal"
                value={height}
                onChange={(e) => {
                  setHeight(e.target.value);
                  if (error) setError(null);
                }}
                className="h-11 min-w-0 flex-1 border border-line bg-white px-3 text-[14px] focus:border-ink focus:outline-none"
              />
              <div className="flex shrink-0">
                {(["cm", "ft"] as const).map((u) => (
                  <button
                    key={u}
                    type="button"
                    aria-pressed={unit === u}
                    onClick={() => setUnit(u)}
                    className={
                      "h-11 w-11 border text-[13px] " +
                      (unit === u
                        ? "border-ink bg-ink text-white"
                        : "border-line bg-white text-muted")
                    }
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-[13px] text-muted">Weight (kg)</span>
            <input
              inputMode="decimal"
              value={weight}
              onChange={(e) => {
                setWeight(e.target.value);
                if (error) setError(null);
              }}
              className="h-11 w-full border border-line bg-white px-3 text-[14px] focus:border-ink focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-[13px] text-muted">Build</span>
            <select
              value={build}
              onChange={(e) => setBuild(e.target.value)}
              className="h-11 w-full border border-line bg-white px-3 text-[14px] focus:border-ink focus:outline-none"
            >
              {BUILDS.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-line pt-5">
          <button
            type="button"
            onClick={recommend}
            className="h-11 bg-lime px-6 text-btn text-ink transition-opacity hover:opacity-90"
          >
            Recommend my size
          </button>
          {result && (
            <div className="border border-line bg-white px-5 py-2.5" aria-live="polite">
              <p className="text-[20px] font-medium leading-none">Recommended: {result}</p>
              <p className="mt-1.5 text-[12px] text-muted">
                Based on {height} {unit}, {weight} kg, {build.toLowerCase()} build
              </p>
            </div>
          )}
        </div>
        {error && <p className="mt-3 text-[13px] text-[#a32d2d]">{error}</p>}
      </section>

      <section className="mt-8">
        <h2 className="text-[16px] font-medium">Your sizes</h2>
        <ul className="mt-4 border border-line">
          {SIZE_CATEGORIES.map((c, i) => (
            <li
              key={c.key}
              className={
                "flex flex-wrap items-center justify-between gap-3 p-4 " +
                (i > 0 ? "border-t border-line" : "")
              }
            >
              <span className="text-[14px]">{c.label}</span>
              <div className="flex gap-1.5">
                {SIZES.map((s) => {
                  const on = sizes[c.key] === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      aria-pressed={on}
                      aria-label={`${c.label}: size ${s}`}
                      onClick={() => {
                        setSizes({ ...sizes, [c.key]: s });
                        setSaved(false);
                      }}
                      className={
                        "h-9 w-11 border text-[13px] transition-colors " +
                        (on
                          ? "border-ink bg-ink text-white"
                          : "border-line bg-white hover:border-ink")
                      }
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-[16px] font-medium">Fit preference</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {FITS.map((f) => {
            const on = fit === f.key;
            return (
              <button
                key={f.key}
                type="button"
                aria-pressed={on}
                onClick={() => {
                  setFit(f.key);
                  setSaved(false);
                }}
                className={
                  "border-2 p-5 text-left transition-colors " +
                  (on ? "border-lime bg-white" : "border-line bg-white hover:border-ink")
                }
              >
                <span className="block text-[15px] font-medium">{f.label}</span>
                <span className="mt-1 block text-[13px] text-muted">{f.note}</span>
              </button>
            );
          })}
        </div>
      </section>

      <details className="mt-8 group border border-line">
        <summary className="flex cursor-pointer list-none items-center justify-between p-4 text-[15px] marker:content-none">
          View full size chart in cm
          <span className="text-[18px] leading-none text-muted" aria-hidden>
            <span className="group-open:hidden">+</span>
            <span className="hidden group-open:inline">−</span>
          </span>
        </summary>
        <div className="overflow-x-auto border-t border-line">
          <table className="w-full min-w-[420px] text-[13px]">
            <thead>
              <tr className="bg-alt text-left text-muted">
                <th className="p-3 font-normal">Size</th>
                <th className="p-3 font-normal">Chest</th>
                <th className="p-3 font-normal">Length</th>
                <th className="p-3 font-normal">Shoulder</th>
              </tr>
            </thead>
            <tbody>
              {SIZE_CHART.map((r) => (
                <tr key={r.size} className="border-t border-line">
                  <td className="p-3">{r.size}</td>
                  <td className="p-3 text-muted">{r.chest} cm</td>
                  <td className="p-3 text-muted">{r.length} cm</td>
                  <td className="p-3 text-muted">{r.shoulder} cm</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-line pt-6">
        <button
          type="button"
          onClick={() => {
            writeSizeProfile({ ...(sizes as unknown as SizeProfile), fit });
            setSaved(true);
          }}
          className="h-12 bg-ink px-8 text-btn text-white transition-opacity hover:opacity-90"
        >
          Save size profile
        </button>
        {saved && (
          <p className="text-[13px] text-[#5f7f06]" aria-live="polite">
            Size profile saved — we will pre-select these on every product page.
          </p>
        )}
      </div>
    </>
  );
}
