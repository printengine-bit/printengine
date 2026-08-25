"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-ink text-white">
        <div className="container-pe flex h-16 items-center">
          <Link href="/" className="flex items-center" aria-label="PrintEngine home">
            <Image src="/brand/printengine-dark.png" alt="PrintEngine" width={500} height={200} priority className="h-auto w-[132px]" />
          </Link>
        </div>
      </header>
      <main id="main" className="flex flex-1 items-center">
        <div className="container-pe py-20">
          <p className="text-[12px] uppercase tracking-[0.14em] text-muted">Something went wrong</p>
          <h1 className="mt-4 text-h1m lg:text-h1">We hit a snag</h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted">
            This page failed to load. Your cart and saved designs are safe — nothing was lost.
          </p>
          {error.digest && (
            <p className="mt-3 text-[12px] text-muted">Reference: {error.digest}</p>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={reset}
              className="flex h-12 items-center bg-lime px-7 text-btn text-ink transition-opacity hover:opacity-90"
            >
              Try again
            </button>
            <Link
              href="/"
              className="flex h-12 items-center border border-ink px-7 text-btn transition-colors hover:bg-ink hover:text-white"
            >
              Go to the homepage
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
