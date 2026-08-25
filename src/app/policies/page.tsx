import type { Metadata } from "next";
import Link from "next/link";
import StorefrontShell from "@/components/layout/StorefrontShell";
import { policies } from "@/lib/content";

export const metadata: Metadata = {
  title: "Information",
  description: "Shipping, returns, privacy, terms and how to reach us.",
};

export default function Page() {
  return (
    <StorefrontShell>
        <div className="container-pe py-8 lg:py-10">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-[13px] text-muted">
              <li className="flex items-center gap-2">
                <Link href="/" className="underline-offset-4 hover:text-ink hover:underline">
                  Home
                </Link>
                <span aria-hidden>/</span>
              </li>
              <li className="text-ink">Information</li>
            </ol>
          </nav>

          <h1 className="mt-6 text-h1m lg:text-h1">Information</h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted">Shipping, returns, privacy, terms and how to reach us.</p>

          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {policies.map((c) => (
              <li key={c.slug}>
                <Link
                  href={"/policies/" + c.slug}
                  className="flex h-full flex-col border border-line p-5 transition-colors hover:border-ink"
                >
                  <span className="text-[16px] font-medium">{c.title}</span>
                  <span className="mt-2 text-[14px] leading-relaxed text-muted">{c.intro}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
    </StorefrontShell>
  );
}
