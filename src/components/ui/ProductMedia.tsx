"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import Garment, { type GarmentKind } from "@/components/ui/Garment";
import type { AreaId } from "@/lib/design";

const VIEW_POSITION: Record<AreaId, { left: string; top: string }> = {
  front: { left: "0", top: "0" },
  back: { left: "-100%", top: "0" },
  left: { left: "0", top: "-100%" },
  right: { left: "-100%", top: "-100%" },
};

const COLOURED_COVER_SLUGS = new Set([
  "classic-half-sleeve-tee",
  "full-sleeve-tee",
  "premium-polo",
  "oversized-tee",
  "heavyweight-boxy-tee",
  "dry-fit-round-neck",
  "kids-half-sleeve-tee",
  "long-sleeve-henley",
  "fleece-hoodie",
  "zipper-hoodie",
  "oversized-hoodie",
  "crew-sweatshirt",
  "oversized-sweatshirt",
  "dry-fit-jersey",
  "cricket-jersey",
  "football-jersey",
]);

const KIDS_COVER_SLUGS = new Set([
  "classic-half-sleeve-tee",
  "dry-fit-round-neck",
  "kids-half-sleeve-tee",
  "fleece-hoodie",
  "crew-sweatshirt",
  "dry-fit-jersey",
  "cricket-jersey",
  "football-jersey",
]);

/**
 * Original neutral garment photographs from the previous Printly project.
 * The source garment is never redrawn: the canvas engine below keys out the
 * black background and shades the chosen colour with the photo's luminance.
 */
const PHOTO_VIEWS: Partial<Record<GarmentKind, Partial<Record<AreaId, string>>>> = {
  "tee-half": {
    front: "/products/mockups/rn.jpg",
    back: "/products/mockups/rn_back.jpg",
    left: "/products/mockups/rn_left.png",
    right: "/products/mockups/rn_right.png",
  },
  polo: {
    front: "/products/mockups/po.jpg",
    back: "/products/mockups/po_back.jpg",
    left: "/products/mockups/po_left.png",
    right: "/products/mockups/po_right.png",
  },
  hoodie: {
    front: "/products/mockups/hd.jpg",
    back: "/products/mockups/hd_back.jpg",
    left: "/products/mockups/hd_left_sleeve.png",
    right: "/products/mockups/hd_right_sleeve_v2.png",
  },
  jersey: {
    front: "/products/mockups/js.jpg",
    back: "/products/mockups/js_back.jpg",
    left: "/products/mockups/js_left.png",
    right: "/products/mockups/js_right.png",
  },
};

const sourceImages = new Map<string, HTMLImageElement>();
const sourcePromises = new Map<string, Promise<HTMLImageElement>>();
const recolouredPhotos = new Map<string, HTMLCanvasElement>();
const backgroundMasks = new Map<string, Uint8Array>();

const SPRITE_SOURCES: Partial<Record<GarmentKind, string>> = {
  "tee-full": "/products/views/tee-full-alpha.png?v=2",
  henley: "/products/views/henley.png?v=1",
  oversized: "/products/views/oversized-alpha.png?v=2",
  sweatshirt: "/products/views/sweatshirt-alpha.png?v=2",
  apron: "/products/views/apron-alpha.png?v=2",
};

// Catalogue covers may contain a model; editor media never may. Product-specific
// blank assets take precedence over the shared garment-family mockups.
const PRODUCT_EDITOR_VIEWS: Record<string, string> = {
  "vintage-washed-tee": "/products/editor-vintage-washed-tee.png",
  "maroon-scrub-set": "/products/editor-maroon-scrub-set.png",
};

const FRONT_ONLY_KINDS = new Set<GarmentKind>([
  "cargo", "varsity", "basketball", "cap", "tote", "sling", "socks",
  "medical-tunic", "medical-wrap-tunic", "mens-short-lab-coat",
  "womens-short-lab-coat", "scrub-set",
]);

export const hasFourViewMedia = (kind: GarmentKind, slug?: string) =>
  !FRONT_ONLY_KINDS.has(kind) && !Boolean(slug && PRODUCT_EDITOR_VIEWS[slug]);

function loadSource(src: string, priority: boolean) {
  const existing = sourceImages.get(src);
  if (existing) return Promise.resolve(existing);
  const pending = sourcePromises.get(src);
  if (pending) return pending;

  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.decoding = "async";
    image.fetchPriority = priority ? "high" : "auto";
    image.onload = () => {
      sourceImages.set(src, image);
      resolve(image);
    };
    image.onerror = () => reject(new Error(`Could not load garment mockup: ${src}`));
    image.src = src;
  });

  sourcePromises.set(src, promise);
  return promise;
}

function hexToRgb(hex: string) {
  const value = hex.replace("#", "");
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
  ] as const;
}

function getBackgroundMask(
  src: string,
  pixels: Uint8ClampedArray,
  width: number,
  height: number
) {
  const cached = backgroundMasks.get(src);
  if (cached) return cached;

  const total = width * height;
  const mask = new Uint8Array(total);
  const corners = [0, width - 1, (height - 1) * width, total - 1];
  const cornerLuminance =
    corners.reduce((sum, pixel) => {
      const offset = pixel * 4;
      return sum + (pixels[offset] + pixels[offset + 1] + pixels[offset + 2]) / 3;
    }, 0) / corners.length;
  const hasTransparentCorner = corners.some((pixel) => pixels[pixel * 4 + 3] === 0);

  if (hasTransparentCorner) {
    for (let pixel = 0; pixel < total; pixel += 1) {
      if (pixels[pixel * 4 + 3] === 0) mask[pixel] = 1;
    }
  } else if (cornerLuminance < 48) {
    for (let pixel = 0; pixel < total; pixel += 1) {
      const offset = pixel * 4;
      const brightest = Math.max(pixels[offset], pixels[offset + 1], pixels[offset + 2]);
      if (pixels[offset + 3] === 0 || brightest <= 24) mask[pixel] = 1;
    }
  } else {
    // The generated four-view sheets use a warm near-white studio backdrop.
    // Flood only from the canvas edges so near-white highlights inside the
    // garment remain part of the fabric mask and retain their texture.
    const queue = new Uint32Array(total);
    let head = 0;
    let tail = 0;

    const addBackgroundPixel = (pixel: number, from?: number) => {
      if (mask[pixel]) return;
      const offset = pixel * 4;
      const red = pixels[offset];
      const green = pixels[offset + 1];
      const blue = pixels[offset + 2];
      const alpha = pixels[offset + 3];
      const brightest = Math.max(red, green, blue);
      const darkest = Math.min(red, green, blue);
      const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
      if (alpha !== 0 && (luminance < 226 || brightest - darkest > 28)) return;
      if (from !== undefined) {
        const fromOffset = from * 4;
        const localDifference = Math.max(
          Math.abs(red - pixels[fromOffset]),
          Math.abs(green - pixels[fromOffset + 1]),
          Math.abs(blue - pixels[fromOffset + 2])
        );
        if (localDifference > 4) return;
      }
      mask[pixel] = 1;
      queue[tail] = pixel;
      tail += 1;
    };

    for (let x = 0; x < width; x += 1) {
      addBackgroundPixel(x);
      addBackgroundPixel((height - 1) * width + x);
    }
    for (let y = 0; y < height; y += 1) {
      addBackgroundPixel(y * width);
      addBackgroundPixel(y * width + width - 1);
    }

    while (head < tail) {
      const pixel = queue[head];
      head += 1;
      const x = pixel % width;
      const y = Math.floor(pixel / width);
      if (x > 0) addBackgroundPixel(pixel - 1, pixel);
      if (x + 1 < width) addBackgroundPixel(pixel + 1, pixel);
      if (y > 0) addBackgroundPixel(pixel - width, pixel);
      if (y + 1 < height) addBackgroundPixel(pixel + width, pixel);
    }
  }

  backgroundMasks.set(src, mask);
  return mask;
}

/** Exact TypeScript port of getRecoloredMock() from the old repository. */
function recolourPhoto(src: string, image: HTMLImageElement, colour: string) {
  const key = `${src}|${colour.toLowerCase()}`;
  const cached = recolouredPhotos.get(key);
  if (cached) return cached;

  const width = image.naturalWidth;
  const height = image.naturalHeight;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return canvas;

  context.drawImage(image, 0, 0);
  const [targetRed, targetGreen, targetBlue] = hexToRgb(colour);
  const targetLuminance =
    (0.2126 * targetRed + 0.7152 * targetGreen + 0.0722 * targetBlue) / 255;
  const imageData = context.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  const oldBackground = getBackgroundMask(src, pixels, width, height);

  for (let offset = 0; offset < pixels.length; offset += 4) {
    const red = pixels[offset];
    const green = pixels[offset + 1];
    const blue = pixels[offset + 2];
    const alpha = pixels[offset + 3];
    const brightest = Math.max(red, green, blue);

    if (oldBackground[offset / 4]) {
      pixels[offset + 3] = 0;
      continue;
    }

    const pixel = offset / 4;
    const x = pixel % width;
    const y = Math.floor(pixel / width);
    let touchesBackground = false;

    if (brightest < 220) {
      for (let offsetY = -2; offsetY <= 2 && !touchesBackground; offsetY += 1) {
        const neighbourY = y + offsetY;
        if (neighbourY < 0 || neighbourY >= height) continue;
        for (let offsetX = -2; offsetX <= 2; offsetX += 1) {
          const neighbourX = x + offsetX;
          if (
            neighbourX >= 0 &&
            neighbourX < width &&
            oldBackground[neighbourY * width + neighbourX]
          ) {
            touchesBackground = true;
            break;
          }
        }
      }
    }

    const edgeAlpha = touchesBackground
      ? Math.max(0, Math.min(1, (brightest - 24) / 196))
      : brightest < 120
        ? (brightest - 24) / 96
        : 1;
    pixels[offset + 3] = Math.round(alpha * edgeAlpha);

    const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
    const fabricLuminance = edgeAlpha < 1 ? Math.min(255, luminance / edgeAlpha) : luminance;
    let tone = Math.max(0, Math.min(1, (fabricLuminance - 120) / 135));

    if (touchesBackground) tone = 1;
    else if (edgeAlpha < 1) tone = Math.max(0.92, tone);

    const shade = 0.1 + 0.9 * tone;
    const sheen = 36 * tone * tone * tone * (1 - targetLuminance);
    pixels[offset] = Math.min(255, Math.round(targetRed * shade + sheen));
    pixels[offset + 1] = Math.min(255, Math.round(targetGreen * shade + sheen));
    pixels[offset + 2] = Math.min(255, Math.round(targetBlue * shade + sheen));
  }

  context.putImageData(imageData, 0, 0);
  recolouredPhotos.set(key, canvas);
  return canvas;
}

export function ProductCover({
  slug,
  name,
  className = "",
  sizes = "(max-width: 640px) 50vw, (max-width: 1200px) 33vw, 25vw",
  eager = false,
  kidsCover = false,
  coverUrl,
  altText,
}: {
  slug: string;
  name: string;
  className?: string;
  sizes?: string;
  eager?: boolean;
  kidsCover?: boolean;
  coverUrl?: string;
  altText?: string;
}) {
  const showChildModel =
    KIDS_COVER_SLUGS.has(slug) && (kidsCover || slug === "kids-half-sleeve-tee");
  const coverFolder = showChildModel
    ? "covers-kids"
    : COLOURED_COVER_SLUGS.has(slug)
      ? "covers-coloured"
      : "covers";

  return (
    <Image
      src={coverUrl||`/products/${coverFolder}/${slug}.png`}
      alt={altText||`${name} worn by a ${showChildModel ? "child" : "printengine studio"} model`}
      fill
      sizes={sizes}
      loading={eager ? "eager" : "lazy"}
      unoptimized={Boolean(coverUrl)||slug === "premium-polo"}
      className={`object-cover object-top ${className}`}
    />
  );
}

function RecolouredGarment({
  src,
  colour,
  priority,
  mirror = false,
  spritePosition,
}: {
  src: string;
  colour: string;
  priority: boolean;
  mirror?: boolean;
  spritePosition?: { left: string; top: string };
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;
    const target = canvasRef.current;
    if (!target) return;

    loadSource(src, priority)
      .then((image) => {
        if (cancelled) return;
        const result = recolourPhoto(src, image, colour);
        target.width = result.width;
        target.height = result.height;
        const context = target.getContext("2d");
        context?.clearRect(0, 0, target.width, target.height);
        context?.drawImage(result, 0, 0);
      })
      .catch(() => {
        // The stage stays clean if an asset cannot be loaded.
      });

    return () => {
      cancelled = true;
    };
  }, [src, colour, priority]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={
        spritePosition
          ? "pointer-events-none absolute max-w-none select-none"
          : "pointer-events-none absolute inset-0 h-full w-full object-contain p-[4%]"
      }
      style={
        spritePosition
          ? {
              width: "200%",
              height: "200%",
              left: spritePosition.left,
              top: spritePosition.top,
            }
          : { transform: mirror ? "scaleX(-1)" : undefined }
      }
    />
  );
}

export function GarmentPhoto({
  kind,
  slug,
  area = "front",
  colour = "#ffffff",
  name = "Garment",
  className = "",
  priority = false,
}: {
  kind: GarmentKind;
  slug?: string;
  area?: AreaId;
  colour?: string;
  name?: string;
  className?: string;
  priority?: boolean;
}) {
  const photo = PHOTO_VIEWS[kind]?.[area];
  const sprite = SPRITE_SOURCES[kind];
  const productEditorView = slug && area === "front" ? PRODUCT_EDITOR_VIEWS[slug] : undefined;
  const position = VIEW_POSITION[area];
  // The supplied hoodie has real opposite-side photographs. The generated
  // tee, polo and jersey side sources were shot facing the same direction,
  // so reverse only the right garment image. Artwork is a separate layer in
  // ProductView and intentionally remains readable rather than mirrored.
  const mirrorPhoto = area === "right" && kind !== "hoodie";

  return (
    <div
      className={`relative isolate overflow-hidden bg-[#f7f5f2] ${className}`}
      role="img"
      aria-label={`${name}, ${area === "left" || area === "right" ? `${area} side` : area} view`}
    >
      {productEditorView ? (
        <Image
          src={productEditorView}
          alt=""
          fill
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          sizes="(max-width: 1024px) 100vw, 55vw"
          className="pointer-events-none select-none object-contain object-top p-[2%]"
        />
      ) : photo ? (
        <RecolouredGarment
          src={photo}
          colour={colour}
          priority={priority}
          mirror={mirrorPhoto}
        />
      ) : sprite ? (
        <RecolouredGarment
          src={sprite}
          colour={colour}
          priority={priority}
          spritePosition={position}
        />
      ) : (
        <Garment
          kind={kind}
          colour={colour}
          className="pointer-events-none absolute inset-0 h-full w-full select-none p-[8%]"
        />
      )}
    </div>
  );
}
