import Link from "next/link";
import type { Metadata } from "next";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Garment from "@/components/ui/Garment";
import { categories } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main id="main">
        <div className="container-pe grid gap-10 py-16 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center lg:py-24">
          <div>
            <p className="text-[12px] uppercase tracking-[0.14em] text-muted">Error 404</p>
            <h1 className="mt-4 text-h1m lg:text-h1">This page does not exist</h1>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted">
              The link may be out of date, or the page may have moved. Everything we print is still
              a click away.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="flex h-12 items-center bg-lime px-7 text-btn text-ink transition-opacity hover:opacity-90"
              >
                Browse all products
              </Link>
              <Link
                href="/studio"
                className="flex h-12 items-center border border-ink px-7 text-btn transition-colors hover:bg-ink hover:text-white"
              >
                Open the design studio
              </Link>
            </div>

            <p className="mt-10 text-[11px] uppercase tracking-[0.12em] text-muted">
              Or jump to a category
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/shop/${c.slug}`}
                    className="block border border-line px-4 py-2 text-[13px] transition-colors hover:border-ink"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/search"
                  className="block border border-line px-4 py-2 text-[13px] transition-colors hover:border-ink"
                >
                  Search
                </Link>
              </li>
            </ul>
          </div>

          <div className="bg-alt p-10 max-lg:hidden">
            <Garment kind="tee-half" printArea className="h-full w-full" />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
