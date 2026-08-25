import type { GarmentKind } from "@/components/ui/Garment";

export const SIZE_PROFILE_KEY = "printengine.sizeProfile";

export type SizeProfile = {
  tees: string;
  polo: string;
  winter: string;
  jersey: string;
  apron: string;
  fit: string;
};

export const DEFAULT_PROFILE: SizeProfile = {
  tees: "M",
  polo: "M",
  winter: "L",
  jersey: "M",
  apron: "L",
  fit: "regular",
};

export function sizeKeyFor(kind: GarmentKind): keyof SizeProfile {
  switch (kind) {
    case "polo":
      return "polo";
    case "hoodie":
    case "sweatshirt":
      return "winter";
    case "jersey":
      return "jersey";
    case "apron":
      return "apron";
    default:
      return "tees";
  }
}

export function readSizeProfile(): SizeProfile | null {
  try {
    const raw = localStorage.getItem(SIZE_PROFILE_KEY);
    if (!raw) return null;
    return { ...DEFAULT_PROFILE, ...(JSON.parse(raw) as Partial<SizeProfile>) };
  } catch {
    return null;
  }
}

export function writeSizeProfile(p: SizeProfile) {
  try {
    localStorage.setItem(SIZE_PROFILE_KEY, JSON.stringify(p));
  } catch {
    // storage unavailable — the profile simply will not persist
  }
}

