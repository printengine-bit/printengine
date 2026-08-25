import type { AreaId, Design } from "@/lib/design";

const DESIGNS_KEY = "printengine.designs";
const PENDING_KEY = "printengine.pendingDesign";

export type DesignSource = "ai" | "upload" | "text";

export type StoredDesign = {
  id: string;
  name: string;
  source: DesignSource;
  detail: string;
  savedOn: string;
  usedIn: number;
  liked: boolean;
  design: Design;
};

export type PendingDesign = {
  slug: string;
  designs: Partial<Record<AreaId, Design>>;
  colour?: string;
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function readDesigns(): StoredDesign[] {
  return read<StoredDesign[]>(DESIGNS_KEY, []);
}

export function describe(d: Design): { source: DesignSource; name: string; detail: string } {
  if (d.kind === "upload") {
    return { source: "upload", name: d.name.replace(/\.[^.]+$/, ""), detail: d.name };
  }
  if (d.kind === "text") {
    return { source: "text", name: d.text, detail: d.text + " · custom text" };
  }
  const words = d.prompt.trim().split(/\s+/).slice(0, 4).join(" ");
  return {
    source: "ai",
    name: words.charAt(0).toUpperCase() + words.slice(1),
    detail: d.prompt,
  };
}

export function saveDesigns(designs: Design[], savedOn = "Today"): number {
  const existing = readDesigns();
  const keyOf = (d: Design) => JSON.stringify(d);
  const known = new Set(existing.map((e) => keyOf(e.design)));
  const fresh: StoredDesign[] = [];

  designs.forEach((d, i) => {
    const k = keyOf(d);
    if (known.has(k)) return;
    known.add(k);
    const meta = describe(d);
    fresh.push({
      id: "sd" + (existing.length + fresh.length + i),
      ...meta,
      savedOn,
      usedIn: 0,
      liked: false,
      design: d,
    });
  });

  if (fresh.length === 0) return 0;
  try {
    localStorage.setItem(DESIGNS_KEY, JSON.stringify([...fresh, ...existing]));
  } catch {
    return 0;
  }
  return fresh.length;
}

export function updateDesigns(next: StoredDesign[]) {
  try {
    localStorage.setItem(DESIGNS_KEY, JSON.stringify(next));
  } catch {
    // storage unavailable
  }
}

export function writePending(p: PendingDesign) {
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify(p));
  } catch {
    // storage unavailable
  }
}

export function takePending(): PendingDesign | null {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    localStorage.removeItem(PENDING_KEY);
    return JSON.parse(raw) as PendingDesign;
  } catch {
    return null;
  }
}
