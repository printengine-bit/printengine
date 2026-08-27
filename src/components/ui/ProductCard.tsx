"use client";

import Link from "next/link";
import { ProductCover } from "@/components/ui/ProductMedia";
import { Heart } from "@/components/ui/icons";
import { hexFor, inr, type Product } from "@/lib/catalog";
import { useCart } from "@/lib/cart-store";
import { DEMO_MODE } from "@/lib/demo";

export default function ProductCard({
  product,
  showSwatches = true,
  eagerImage = false,
  kidsCover = false,
}: {
  product: Product;
  showSwatches?: boolean;
  eagerImage?: boolean;
  kidsCover?: boolean;
}) {
  const off = Math.round(((product.mrp - product.price) / product.mrp) * 100);
  const { inWishlist, toggleWishlist, hydrated } = useCart();
  const saved = hydrated && inWishlist(product.slug);

  return (
    <article className="group">
      <div className="relative aspect-[4/5] overflow-hidden bg-alt">
        <Link
          href={`/product/${product.slug}`}
          aria-label={`View ${product.name}`}
          className="absolute inset-0"
        >
          <ProductCover
            slug={product.slug}
            name={product.name}
            eager={eagerImage}
            kidsCover={kidsCover}
            className="transition-transform duration-500 group-hover:scale-[1.025]"
          />
        </Link>
        <div className="absolute left-0 top-0 z-10 flex flex-col items-start">
          <span className="bg-lime px-2.5 py-1 text-[11px] font-medium text-ink">
            Customisable
          </span>
          {product.isNew && (
            <span className="bg-ink px-2.5 py-1 text-[11px] font-medium text-white">New</span>
          )}
        </div>

        <button
          type="button"
          onClick={() => toggleWishlist(product.slug)}
          aria-pressed={saved}
          aria-label={
            saved ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`
          }
          className={
            "absolute right-3 top-3 z-10 p-1 transition-colors " +
            (saved ? "text-[#5f7f06]" : "text-ink/60 hover:text-ink")
          }
        >
          <Heart className="h-5 w-5" />
        </button>

        {DEMO_MODE && product.stock !== undefined && product.stock <= 4 && (
          <span className="absolute bottom-3 left-3 z-10 border border-line bg-white px-2 py-1 text-[11px] text-[#8a2b2b]">
            Only {product.stock} left
          </span>
        )}
      </div>

      <div className="mt-3">
        {showSwatches && (
          <ul
            className="mb-2.5 flex min-h-5 items-center gap-1.5"
            aria-label={`Available colours for ${product.name}`}
          >
            {product.colours.slice(0, 5).map((colour) => (
              <li
                key={colour}
                title={colour}
                className="relative h-[18px] w-[18px] shrink-0 rounded-full border border-black/15 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25)]"
                style={{ backgroundColor: hexFor(colour) }}
              >
                <span className="sr-only">{colour}</span>
              </li>
            ))}
            {product.colours.length > 5 && (
              <li className="ml-0.5 whitespace-nowrap text-[11px] text-muted">
                +{product.colours.length - 5} more
              </li>
            )}
          </ul>
        )}

        <h3 className="text-[15px] leading-snug">
          <Link href={`/product/${product.slug}`} className="underline-offset-4 hover:underline">
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 text-[13px] text-muted">{product.subtitle}</p>
        <p className="mt-2 flex flex-wrap items-baseline gap-x-2">
          <span className="text-[15px] font-medium">{inr(product.price)}</span>
          <span className="text-[13px] text-muted line-through">{inr(product.mrp)}</span>
          <span className="text-[13px] text-[#5f7f06]">{off}% off</span>
        </p>

      </div>
    </article>
  );
}
