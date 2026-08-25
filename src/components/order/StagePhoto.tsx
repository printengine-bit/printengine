import type { StageKind } from "@/lib/orders";

const stroke = { fill: "none", stroke: "#0a0a0a", strokeWidth: 1.2 } as const;

export default function StagePhoto({
  kind,
  className = "",
}: {
  kind: StageKind;
  className?: string;
}) {
  return (
    <div className={"relative bg-alt " + className}>
      <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label={`Production photo, ${kind}`}>
        {kind === "press" && (
          <>
            <rect x="14" y="52" width="72" height="30" {...stroke} />
            <rect x="26" y="24" width="48" height="24" {...stroke} />
            <path d="M50 48v4M30 82v8M70 82v8" {...stroke} />
            <rect x="34" y="58" width="32" height="18" fill="#b8f20a" opacity="0.65" />
          </>
        )}
        {kind === "garment" && (
          <>
            <path
              d="M36 26l-8-4-14 10 6 14 8-4v34h44V42l8 4 6-14-14-10-8 4a10 10 0 0 1-28 0Z"
              {...stroke}
            />
            <rect x="42" y="46" width="16" height="20" fill="#b8f20a" opacity="0.7" />
          </>
        )}
        {kind === "check" && (
          <>
            <circle cx="50" cy="50" r="24" {...stroke} />
            <path d="M39 50l8 8 15-17" stroke="#0a0a0a" strokeWidth="2.4" fill="none" />
            <circle cx="50" cy="50" r="32" stroke="#b8f20a" strokeWidth="1.5" fill="none" />
          </>
        )}
        {kind === "receipt" && (
          <>
            <path d="M30 20h40v58l-8-5-6 5-6-5-6 5-6-5-8 5Z" {...stroke} />
            <path d="M38 36h24M38 46h24M38 56h14" {...stroke} />
          </>
        )}
        {kind === "box" && (
          <>
            <path d="M20 38l30-14 30 14v30L50 82 20 68Z" {...stroke} />
            <path d="M20 38l30 14 30-14M50 52v30" {...stroke} />
          </>
        )}
      </svg>
    </div>
  );
}
