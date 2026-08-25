"use client";

import { useEffect, useRef, useState } from "react";
import DesignRender from "@/components/product/DesignRender";
import { Heart } from "@/components/ui/icons";
import { FREE_GENERATIONS, STYLES, type Design, type Style } from "@/lib/design";

const TABS = ["Generate with AI", "Upload artwork", "Add text"] as const;
export type Tab = (typeof TABS)[number];

const FONTS = [
  { label: "Inter", value: "var(--font-inter), sans-serif" },
  { label: "Serif", value: "Georgia, serif" },
  { label: "Mono", value: "ui-monospace, monospace" },
];

export default function DesignStudio({
  areaLabel,
  onApply,
  saved,
  onToggleSave,
  initialTab,
}: {
  areaLabel: string;
  onApply: (d: Design) => void;
  saved: string[];
  onToggleSave: (key: string) => void;
  initialTab?: Tab;
}) {
  const [tab, setTab] = useState<Tab>(initialTab ?? "Generate with AI");

  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState<Style>("Minimal line");
  const [results, setResults] = useState<Design[]>([]);
  const [chosen, setChosen] = useState<number | null>(null);
  const [used, setUsed] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [text, setText] = useState("");
  const [font, setFont] = useState(FONTS[0].value);
  const [textColour, setTextColour] = useState("#0a0a0a");
  const [textError, setTextError] = useState<string | null>(null);

  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const remaining = Math.max(0, FREE_GENERATIONS - used);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const day = new Date().toISOString().slice(0, 10);
    const raw = localStorage.getItem(`printengine.ai.${day}`);
    setUsed(raw ? Math.max(0, Number(raw) || 0) : 0);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const generate = async () => {
    const p = prompt.trim();
    if (!p) {
      setError("Describe your print first.");
      return;
    }
    if (remaining === 0) {
      setError("You have used all free generations today.");
      return;
    }
    setError(null);
    setGenerating(true);
    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt: p, style }),
      });
      const result = (await response.json()) as { designs?: Design[]; error?: string };
      if (!response.ok || !result.designs?.length) {
        throw new Error(result.error || "AI generation is temporarily unavailable.");
      }
      setResults(result.designs);
      setChosen(null);
      setUsed((current) => {
        const next = current + 1;
        const day = new Date().toISOString().slice(0, 10);
        localStorage.setItem(`printengine.ai.${day}`, String(next));
        return next;
      });
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : "AI generation failed.");
    } finally {
      setGenerating(false);
    }
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    if (!/^image\/(png|jpeg|svg\+xml|webp)$/.test(file.type)) {
      setUploadError("Use a PNG, JPG, SVG or WebP file.");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setUploadError("File must be under 15 MB.");
      return;
    }
    setUploadError(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.set("file", file);
      const response = await fetch("/api/assets/upload", { method: "POST", body: form });
      const result = (await response.json()) as { url?: string; publicId?: string; name?: string; error?: string };
      if (!response.ok || !result.url) throw new Error(result.error || "Artwork upload failed.");
      onApply({ kind: "upload", url: result.url, publicId: result.publicId, name: result.name || file.name });
    } catch (uploadFailure) {
      setUploadError(uploadFailure instanceof Error ? uploadFailure.message : "Artwork upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const addText = () => {
    const t = text.trim();
    if (!t) {
      setTextError("Type the text you want printed.");
      return;
    }
    setTextError(null);
    onApply({ kind: "text", text: t, font, colour: textColour });
  };

  return (
    <div className="border border-line bg-alt p-5 lg:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[16px] font-medium">Design your print</h2>
        <span className="text-[12px] text-muted">for {areaLabel.toLowerCase()}</span>
      </div>

      <div className="mt-4 flex border-b border-line" role="tablist">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={
              "-mb-px border-b-2 px-3 py-2.5 text-[13px] transition-colors " +
              (tab === t
                ? "border-ink text-ink"
                : "border-transparent text-muted hover:text-ink")
            }
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Generate with AI" && (
        <div className="mt-5">
          <label htmlFor="pe-prompt" className="sr-only">
            Describe your print
          </label>
          <textarea
            id="pe-prompt"
            rows={2}
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Describe your print — e.g. minimal line-art tiger, single colour"
            className="w-full resize-none border border-line bg-white px-3 py-2.5 text-[14px] focus:border-ink focus:outline-none"
          />

          <div className="mt-3 flex flex-wrap gap-2">
            {STYLES.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={style === s}
                onClick={() => setStyle(s)}
                className={
                  "border px-3 py-1.5 text-[12px] transition-colors " +
                  (style === s
                    ? "border-ink bg-ink text-white"
                    : "border-line bg-white hover:border-ink")
                }
              >
                {s}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={generate}
            className="mt-4 h-11 w-full bg-lime text-btn text-ink transition-opacity hover:opacity-90 disabled:opacity-40"
            disabled={remaining === 0 || generating}
          >
            {generating ? "Generating and saving…" : "Generate 4 designs"}
          </button>

          {error && <p className="mt-2 text-[13px] text-[#a32d2d]">{error}</p>}

          <p className="mt-2 text-center text-[12px] text-muted">
            {remaining} of {FREE_GENERATIONS} free generations left today
          </p>

          {results.length > 0 && (
            <ul className="mt-4 grid grid-cols-4 gap-2">
              {results.map((d, i) => {
                const key = d.kind === "ai" && d.publicId ? d.publicId : `${prompt}|${style}|${i}`;
                const isSaved = saved.includes(key);
                return (
                  <li key={i} className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setChosen(i);
                        onApply(d);
                      }}
                      aria-pressed={chosen === i}
                      aria-label={`Use design variant ${i + 1}`}
                      className={
                        "block aspect-square w-full border-2 bg-white p-2 transition-colors " +
                        (chosen === i ? "border-lime" : "border-line hover:border-ink")
                      }
                    >
                      <DesignRender design={d} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleSave(key)}
                      aria-label={isSaved ? "Remove from saved designs" : "Save this design"}
                      aria-pressed={isSaved}
                      className={
                        "absolute right-1 top-1 p-1 " +
                        (isSaved ? "text-[#5f7f06]" : "text-muted hover:text-ink")
                      }
                    >
                      <Heart className="h-4 w-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {tab === "Upload artwork" && (
        <div className="mt-5">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex w-full flex-col items-center justify-center gap-2 border border-dashed border-muted bg-white px-4 py-10 text-center transition-colors hover:border-ink"
          >
            <span className="text-[14px]">{uploading ? "Uploading securely…" : "Choose a file to upload"}</span>
            <span className="text-[12px] text-muted">PNG, JPG, SVG or WebP · up to 15 MB</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/svg+xml,image/webp"
            className="sr-only"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
          {uploadError && <p className="mt-2 text-[13px] text-[#a32d2d]">{uploadError}</p>}
          <p className="mt-3 text-[12px] leading-relaxed text-muted">
            For a sharp print, upload artwork at 300 DPI at the size you want it printed. We check
            every file before it reaches the press and will contact you if the resolution is too low.
          </p>
        </div>
      )}

      {tab === "Add text" && (
        <div className="mt-5">
          <label htmlFor="pe-text" className="mb-2 block text-[13px] text-muted">
            Your text
          </label>
          <input
            id="pe-text"
            type="text"
            value={text}
            maxLength={24}
            onChange={(e) => {
              setText(e.target.value);
              if (textError) setTextError(null);
            }}
            placeholder="e.g. Dr. A. Sharma"
            className="h-11 w-full border border-line bg-white px-3 text-[14px] focus:border-ink focus:outline-none"
          />

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="pe-font" className="mb-2 block text-[13px] text-muted">
                Font
              </label>
              <select
                id="pe-font"
                value={font}
                onChange={(e) => setFont(e.target.value)}
                className="h-11 w-full border border-line bg-white px-3 text-[14px] focus:border-ink focus:outline-none"
              >
                {FONTS.map((f) => (
                  <option key={f.label} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <span className="mb-2 block text-[13px] text-muted">Thread colour</span>
              <div className="flex gap-2">
                {["#0a0a0a", "#ffffff", "#b8f20a", "#1f2a44"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-label={`Colour ${c}`}
                    aria-pressed={textColour === c}
                    onClick={() => setTextColour(c)}
                    className={
                      "h-11 w-11 border-2 " +
                      (textColour === c ? "border-lime" : "border-line hover:border-ink")
                    }
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={addText}
            className="mt-4 h-11 w-full bg-lime text-btn text-ink transition-opacity hover:opacity-90"
          >
            Add to {areaLabel.toLowerCase()}
          </button>
          {textError && <p className="mt-2 text-[13px] text-[#a32d2d]">{textError}</p>}
        </div>
      )}
    </div>
  );
}
