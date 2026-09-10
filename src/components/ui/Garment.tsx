type Kind =
  | "tee-half"
  | "tee-full"
  | "henley"
  | "polo"
  | "hoodie"
  | "sweatshirt"
  | "jersey"
  | "apron"
  | "oversized"
  | "cargo"
  | "varsity"
  | "basketball"
  | "cap"
  | "tote"
  | "sling"
  | "socks"
  | "medical-tunic"
  | "medical-wrap-tunic"
  | "mens-short-lab-coat"
  | "womens-short-lab-coat"
  | "scrub-set";

const BODY: Record<Kind, string> = {
  "tee-half":
    "M78 44 L62 40 L30 60 L44 96 L64 86 L64 230 L136 230 L136 86 L156 96 L170 60 L138 40 L122 44 Q100 62 78 44 Z",
  oversized:
    "M76 42 L58 38 L22 66 L38 100 L60 90 L58 226 L142 226 L140 90 L162 100 L178 66 L142 38 L124 42 Q100 60 76 42 Z",
  jersey:
    "M78 44 L62 40 L30 60 L44 96 L64 86 L64 230 L136 230 L136 86 L156 96 L170 60 L138 40 L122 44 L100 72 Z",
  polo:
    "M78 44 L62 40 L30 60 L44 96 L64 86 L64 230 L136 230 L136 86 L156 96 L170 60 L138 40 L122 44 Q100 60 78 44 Z",
  "tee-full":
    "M78 44 L62 40 L28 62 L48 150 L70 142 L66 230 L134 230 L130 142 L152 150 L172 62 L138 40 L122 44 Q100 62 78 44 Z",
  henley:
    "M78 44 L62 40 L28 62 L48 150 L70 142 L66 230 L134 230 L130 142 L152 150 L172 62 L138 40 L122 44 Q100 62 78 44 Z",
  sweatshirt:
    "M78 44 L62 40 L28 62 L48 150 L70 142 L66 230 L134 230 L130 142 L152 150 L172 62 L138 40 L122 44 Q100 62 78 44 Z",
  hoodie:
    "M78 46 L62 40 L28 62 L48 150 L70 142 L66 230 L134 230 L130 142 L152 150 L172 62 L138 40 L122 46 Q100 64 78 46 Z",
  apron:
    "M74 44 L58 40 L34 62 L48 98 L64 88 L64 244 L136 244 L136 88 L152 98 L166 62 L142 40 L126 44 L100 76 Z",
  cargo: "M72 44 L128 44 L132 224 L108 224 L100 118 L92 224 L68 224 Z",
  varsity: "M78 44 L62 40 L28 62 L48 150 L70 142 L66 230 L134 230 L130 142 L152 150 L172 62 L138 40 L122 44 Q100 62 78 44 Z",
  basketball: "M78 44 L66 42 L56 62 L68 78 L70 226 L130 226 L132 78 L144 62 L134 42 L122 44 L100 70 Z",
  cap: "M54 112 Q60 54 100 54 Q140 54 146 112 Q100 92 54 112 Z",
  tote: "M56 86 L144 86 L154 222 L46 222 Z",
  sling: "M54 92 Q54 78 68 78 L132 78 Q146 78 146 92 L146 188 Q146 202 132 202 L68 202 Q54 202 54 188 Z",
  socks: "M70 44 L94 44 L94 142 Q94 178 70 214 L48 198 Q70 162 70 132 Z M106 44 L130 44 L130 132 Q130 162 152 198 L130 214 Q106 178 106 142 Z",
  "medical-tunic": "M74 44 L58 40 L34 62 L48 98 L64 88 L64 232 L136 232 L136 88 L152 98 L166 62 L142 40 L126 44 L100 76 Z",
  "medical-wrap-tunic": "M74 44 L58 40 L34 62 L48 98 L64 88 L64 232 L136 232 L136 88 L152 98 L166 62 L142 40 L126 44 L100 76 Z",
  "mens-short-lab-coat": "M74 44 L58 40 L34 62 L48 98 L64 88 L64 232 L136 232 L136 88 L152 98 L166 62 L142 40 L126 44 L100 76 Z",
  "womens-short-lab-coat": "M74 44 L58 40 L34 62 L48 98 L64 88 L64 232 L136 232 L136 88 L152 98 L166 62 L142 40 L126 44 L100 76 Z",
  "scrub-set": "M78 44 L62 40 L30 60 L44 96 L64 86 L64 138 L86 138 L76 230 L98 230 L100 154 L102 230 L124 230 L114 138 L136 138 L136 86 L156 96 L170 60 L138 40 L122 44 L100 72 Z",
};

function Details({ kind }: { kind: Kind }) {
  const line = { stroke: "#6b6b6b", strokeWidth: 1, fill: "none" } as const;
  switch (kind) {
    case "polo":
      return (
        <>
          <path d="M84 46 L94 66 L100 56 L106 66 L116 46" {...line} />
          <path d="M100 56 L100 96" {...line} />
          <circle cx="100" cy="68" r="2" fill="#6b6b6b" />
          <circle cx="100" cy="84" r="2" fill="#6b6b6b" />
        </>
      );
    case "hoodie":
      return (
        <>
          <path
            d="M76 48 Q100 12 124 48 Q100 70 76 48 Z"
            fill="#ffffff"
            stroke="#0a0a0a"
            strokeWidth={1.5}
          />
          <path d="M92 62 L92 92 M108 62 L108 92" {...line} />
          <rect x="72" y="164" width="56" height="34" {...line} />
        </>
      );
    case "sweatshirt":
      return (
        <>
          <path d="M66 216 L134 216 M50 138 L68 132 M150 138 L132 132" {...line} />
          <path d="M82 48 Q100 62 118 48" {...line} />
        </>
      );
    case "jersey":
      return (
        <>
          <path d="M74 96 L74 226 M126 96 L126 226" {...line} />
          <path d="M78 44 L100 72 L122 44" {...line} />
        </>
      );
    case "apron":
      return (
        <>
          <path d="M100 76 L100 244" {...line} />
          <circle cx="100" cy="104" r="2.5" fill="#6b6b6b" />
          <circle cx="100" cy="128" r="2.5" fill="#6b6b6b" />
          <circle cx="100" cy="152" r="2.5" fill="#6b6b6b" />
          <rect x="72" y="176" width="20" height="26" {...line} />
          <rect x="108" y="176" width="20" height="26" {...line} />
        </>
      );
    case "tee-full":
      return <path d="M50 144 L68 138 M150 144 L132 138" {...line} />;
    case "henley":
      return (
        <>
          <path d="M82 48 Q100 60 118 48 M100 56 L100 92" {...line} />
          <circle cx="100" cy="64" r="1.8" fill="#6b6b6b" />
          <circle cx="100" cy="74" r="1.8" fill="#6b6b6b" />
          <circle cx="100" cy="84" r="1.8" fill="#6b6b6b" />
          <path d="M50 144 L68 138 M150 144 L132 138" {...line} />
        </>
      );
    case "oversized":
      return <path d="M60 214 L140 214" {...line} />;
    default:
      return <path d="M82 46 Q100 60 118 46" {...line} />;
  }
}

export default function Garment({
  kind,
  printArea = false,
  colour = "#ffffff",
  className = "",
}: {
  kind: Kind;
  printArea?: boolean;
  colour?: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 200 250"
      className={className}
      role="img"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      <path d={BODY[kind]} fill={colour} stroke="#0a0a0a" strokeWidth={1.5} />
      <Details kind={kind} />
      {printArea && (
        <rect
          x="76"
          y="100"
          width="48"
          height="60"
          fill="none"
          stroke="#b8f20a"
          strokeWidth={1.5}
          strokeDasharray="4 4"
        />
      )}
    </svg>
  );
}

export type { Kind as GarmentKind };
