"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { megaMenu } from "@/lib/catalog";
import { useCart } from "@/lib/cart-store";
import { useDialog } from "@/lib/use-dialog";
import { Bag, ChevronDown, Close, Heart, Menu, Search, User } from "@/components/ui/icons";

const NAV: { label: string; href: string }[] = [
  { label: "Men", href: "/shop?gender=Men" },
  { label: "Women", href: "/shop?gender=Women" },
  { label: "Kids", href: "/shop?gender=Kids" },
  { label: "Design studio", href: "/studio" },
  { label: "Embroidery", href: "/embroidery" },
  { label: "Bulk orders", href: "/bulk-orders" },
];

export default function Header() {
  const [open, setOpen] = useState<string | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const { itemCount, wishlist, hydrated } = useCart();
  const [query, setQuery] = useState("");
  const router = useRouter();
  const drawerRef = useDialog<HTMLDivElement>(drawer, () => setDrawer(false));

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
    setDrawer(false);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(null);
        setDrawer(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-ink text-white">
      <div className="border-b border-white/10">
        <div className="container-pe flex h-16 items-center gap-4 lg:h-[72px]">
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={drawer}
            className="-ml-1 p-1 lg:hidden"
            onClick={() => setDrawer(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <Link href="/" className="flex shrink-0 items-center max-lg:mx-auto" aria-label="PrintEngine home">
            <Image
              src="/brand/printengine-dark.png"
              alt="PrintEngine"
              width={500}
              height={200}
              priority
              className="h-auto w-[126px] lg:w-[138px]"
            />
          </Link>

          <nav className="ml-6 hidden items-center lg:flex" onMouseLeave={() => setOpen(null)}>
            {NAV.map(({ label: item, href }) => (
              <Link
                key={item}
                href={href}
                onMouseEnter={() => setOpen(item)}
                onClick={() => setOpen(null)}
                aria-expanded={open === item}
                className={
                  "flex items-center gap-1 whitespace-nowrap px-3 py-6 text-[14px] transition-colors " +
                  (open === item ? "text-lime" : "text-white/85 hover:text-white")
                }
              >
                {item}
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </Link>
            ))}
            <Link href="/offers" className="px-3 py-6 text-[14px] text-lime">
              Offers
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-1 lg:gap-3">
            <form
              onSubmit={submitSearch}
              className="hidden items-center gap-2 border border-white/15 bg-white/5 px-3 py-2 xl:flex"
            >
              <button type="submit" aria-label="Search" className="shrink-0">
                <Search className="h-4 w-4 text-white/50" />
              </button>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search hoodies, jerseys, aprons…"
                aria-label="Search products"
                className="w-56 bg-transparent text-[13px] text-white placeholder:text-white/45 focus:outline-none"
              />
            </form>
            <Link href="/search" aria-label="Search" className="p-2 xl:hidden">
              <Search className="h-5 w-5" />
            </Link>
            <Link
              href="/account/wishlist"
              aria-label={`Wishlist, ${wishlist.length} ${wishlist.length === 1 ? "item" : "items"}`}
              className="relative p-2 max-lg:hidden"
            >
              <Heart className="h-5 w-5" />
              {hydrated && wishlist.length > 0 && (
                <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center bg-lime px-1 text-[10px] font-medium text-ink">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <Link
              href="/cart"
              aria-label={`Cart, ${itemCount} ${itemCount === 1 ? "item" : "items"}`}
              className="relative p-2"
            >
              <Bag className="h-5 w-5" />
              {hydrated && itemCount > 0 && (
                <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center bg-lime px-1 text-[10px] font-medium text-ink">
                  {itemCount}
                </span>
              )}
            </Link>
            <Link href="/account" aria-label="Account" className="p-2 max-lg:hidden">
              <User className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      {open && (
        <div
          className="absolute inset-x-0 top-full hidden border-b border-line bg-white text-ink lg:block"
          onMouseEnter={() => setOpen(open)}
          onMouseLeave={() => setOpen(null)}
        >
          <div className="container-pe grid grid-cols-4 gap-8 py-10">
            {megaMenu[open].map((col) => (
              <div key={col.heading}>
                <p className="mb-4 text-[11px] uppercase tracking-[0.12em] text-muted">
                  {col.heading}
                </p>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.href + l.label}>
                      <Link
                        href={l.href}
                        onClick={() => setOpen(null)}
                        className="text-[14px] text-ink/80 underline-offset-4 hover:text-ink hover:underline hover:decoration-lime hover:decoration-2"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {drawer && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-ink/50"
            onClick={() => setDrawer(false)}
            aria-hidden
          />
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            tabIndex={-1}
            className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-white text-ink"
          >
            <div className="flex h-16 items-center justify-between border-b border-line px-6">
              <Link href="/" onClick={() => setDrawer(false)} aria-label="PrintEngine home">
                <Image
                  src="/brand/printengine-light.png"
                  alt="PrintEngine"
                  width={500}
                  height={200}
                  className="h-auto w-[132px]"
                />
              </Link>
              <button type="button" aria-label="Close menu" onClick={() => setDrawer(false)}>
                <Close className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto">
              {NAV.map(({ label: item, href }) => (
                <div key={item} className="border-b border-line">
                  <button
                    type="button"
                    onClick={() => setExpanded(expanded === item ? null : item)}
                    aria-expanded={expanded === item}
                    className="flex w-full items-center justify-between px-6 py-4 text-left text-[15px]"
                  >
                    {item}
                    <ChevronDown
                      className={
                        "h-4 w-4 transition-transform " +
                        (expanded === item ? "rotate-180" : "")
                      }
                    />
                  </button>
                  {expanded === item && (
                    <div className="bg-alt px-6 pb-5 pt-1">
                      <Link
                        href={href}
                        onClick={() => setDrawer(false)}
                        className="mb-3 inline-block text-[13px] underline underline-offset-4"
                      >
                        View all {item.toLowerCase()}
                      </Link>
                      {megaMenu[item].map((col) => (
                        <div key={col.heading} className="mt-4 first:mt-0">
                          <p className="mb-2 text-[11px] uppercase tracking-[0.12em] text-muted">
                            {col.heading}
                          </p>
                          <ul className="space-y-2">
                            {col.links.map((l) => (
                              <li key={l.href + l.label}>
                                <Link
                                  href={l.href}
                                  onClick={() => setDrawer(false)}
                                  className="block py-0.5 text-[14px] text-ink/80"
                                >
                                  {l.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <Link
                href="/offers"
                className="block border-b border-line px-6 py-4 text-[15px] text-[#7a9e0a]"
              >
                Offers
              </Link>
            </nav>
            <div className="border-t border-line px-6 py-4">
              <Link href="/account" className="flex items-center gap-3 text-[15px]">
                <User className="h-5 w-5" /> Account and orders
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
