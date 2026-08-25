export type AreaId = "front" | "back" | "left" | "right";

export type Area = {
  id: AreaId;
  label: string;
  size: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export const AREAS: Area[] = [
  { id: "front", label: "Front", size: "30 × 40 cm", x: 76, y: 100, w: 48, h: 60 },
  { id: "back", label: "Back", size: "30 × 42 cm", x: 76, y: 96, w: 48, h: 64 },
  { id: "left", label: "Left side", size: "9 × 11 cm sleeve area", x: 90, y: 82, w: 20, h: 24 },
  { id: "right", label: "Right side", size: "9 × 11 cm sleeve area", x: 90, y: 82, w: 20, h: 24 },
];

export const VIEWBOX = { w: 200, h: 250 };

export type Design =
  | { kind: "ai"; prompt: string; style: string; variant: number; url?: string; publicId?: string }
  | { kind: "upload"; url: string; name: string; publicId?: string }
  | { kind: "text"; text: string; font: string; colour: string };

export const STYLES = ["Minimal line", "Streetwear", "Typography", "Mandala"] as const;
export type Style = (typeof STYLES)[number];

export const FREE_GENERATIONS = 10;

export function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export const round = (n: number) => Math.round(n * 100) / 100;

export type Shape =
  | { t: "circle"; cx: number; cy: number; r: number; stroke: string; fill: string }
  | { t: "line"; x1: number; y1: number; x2: number; y2: number; stroke: string }
  | { t: "rect"; x: number; y: number; w: number; h: number; stroke: string; fill: string };

const INK = "#0a0a0a";
const LIME = "#8fbe08";

export function generateArt(prompt: string, style: Style, variant: number): Shape[] {
  const h = hash(prompt.toLowerCase().trim() + "|" + style + "|" + variant);
  const rnd = (i: number, mod: number) => (Math.floor(h / Math.pow(7, i)) % mod);
  const shapes: Shape[] = [];
  const accent = variant % 2 === 0 ? LIME : INK;

  if (style === "Minimal line") {
    const n = 3 + (rnd(1, 3) as number);
    for (let i = 0; i < n; i++) {
      shapes.push({
        t: "circle",
        cx: round(50 + (rnd(i + 1, 30) - 15)),
        cy: round(50 + (rnd(i + 2, 30) - 15)),
        r: round(10 + rnd(i + 3, 22)),
        stroke: i === 0 ? accent : INK,
        fill: "none",
      });
    }
    for (let i = 0; i < 3; i++) {
      shapes.push({
        t: "line",
        x1: round(10 + rnd(i + 4, 30)),
        y1: round(20 + rnd(i + 5, 60)),
        x2: round(60 + rnd(i + 6, 30)),
        y2: round(20 + rnd(i + 7, 60)),
        stroke: INK,
      });
    }
  } else if (style === "Streetwear") {
    for (let i = 0; i < 5; i++) {
      shapes.push({
        t: "rect",
        x: round(12 + rnd(i + 1, 40)),
        y: round(12 + rnd(i + 2, 40)),
        w: round(14 + rnd(i + 3, 34)),
        h: round(10 + rnd(i + 4, 26)),
        stroke: i % 2 ? accent : INK,
        fill: i === 2 ? accent : "none",
      });
    }
  } else if (style === "Typography") {
    for (let i = 0; i < 6; i++) {
      shapes.push({
        t: "rect",
        x: 14,
        y: round(14 + i * 12),
        w: round(30 + rnd(i + 1, 50)),
        h: 6,
        stroke: "none",
        fill: i === rnd(2, 6) ? accent : INK,
      });
    }
  } else {
    const rings = 5 + (rnd(1, 3) as number);
    for (let i = 0; i < rings; i++) {
      shapes.push({
        t: "circle",
        cx: 50,
        cy: 50,
        r: round(6 + i * (36 / rings)),
        stroke: i % 3 === 0 ? accent : INK,
        fill: "none",
      });
    }
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      shapes.push({
        t: "line",
        x1: round(50 + Math.cos(a) * 12),
        y1: round(50 + Math.sin(a) * 12),
        x2: round(50 + Math.cos(a) * 42),
        y2: round(50 + Math.sin(a) * 42),
        stroke: INK,
      });
    }
  }

  return shapes;
}
