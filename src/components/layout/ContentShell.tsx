import Link from "next/link";
import StorefrontShell from "@/components/layout/StorefrontShell";
import type { ContentPage } from "@/lib/content";

export default function ContentShell({
  page,
  crumbLabel,
  crumbHref,
  related,
}: {
  page: ContentPage;
  crumbLabel: string;
  crumbHref: string;
  related: { title: string; href: string }[];
}) {
  return (
    <StorefrontShell>
        <div className="container-pe py-8 lg:py-10">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 text-[13px] text-muted">
              <li className="flex items-center gap-2">
                <Link href="/" className="underline-offset-4 hover:text-ink hover:underline">
                  Home
                </Link>
                <span aria-hidden>/</span>
              </li>
              <li className="flex items-center gap-2">
                <Link href={crumbHref} className="underline-offset-4 hover:text-ink hover:underline">
                  {crumbLabel}
                </Link>
                <span aria-hidden>/</span>
              </li>
              <li className="text-ink">{page.title}</li>
            </ol>
          </nav>

          <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-14">
            <article className="min-w-0 max-w-2xl">
              <h1 className="text-h1m lg:text-h1">{page.title}</h1>
              <p className="mt-4 text-[16px] leading-relaxed text-muted">{page.intro}</p>

              {page.sections.map((s) => (
                <section key={s.heading} className="mt-10 border-t border-line pt-8">
                  <h2 className="text-[18px] font-medium tracking-[-0.02em]">{s.heading}</h2>
                  {s.body.map((b, i) => (
                    <p key={i} className="mt-3 text-[15px] leading-relaxed text-muted">
                      {b}
                    </p>
                  ))}
                </section>
              ))}

              <div className="mt-12 flex flex-wrap gap-3 border-t border-line pt-8">
                <Link
                  href="/studio"
                  className="flex h-12 items-center bg-lime px-7 text-btn text-ink transition-opacity hover:opacity-90"
                >
                  Start designing
                </Link>
                <Link
                  href="/account/support"
                  className="flex h-12 items-center border border-ink px-7 text-btn transition-colors hover:bg-ink hover:text-white"
                >
                  Ask a question
                </Link>
              </div>
            </article>

            <aside className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.12em] text-muted">More in this section</p>
              <ul className="mt-4 border-t border-line">
                {related.map((r) => (
                  <li key={r.href} className="border-b border-line">
                    <Link
                      href={r.href}
                      className={
                        "block py-3 text-[14px] transition-colors " +
                        (r.title === page.title ? "text-ink" : "text-muted hover:text-ink")
                      }
                    >
                      {r.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
    </StorefrontShell>
  );
}
