import Link from "next/link";
import SignOutButton from "@/components/account/SignOutButton";
import AccountAccess from "@/components/account/AccountAccess";
import StorefrontShell from "@/components/layout/StorefrontShell";
import { ACCOUNT_NAV } from "@/lib/account";
import { sessionUser } from "@/lib/auth";

export default async function AccountShell({
  active,
  title,
  subtitle,
  children,
}: {
  active: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const user = await sessionUser();
  if (!user) {
    return (
      <StorefrontShell mainClassName="container-pe py-20 text-center">
          <p className="text-[11px] uppercase tracking-[0.12em] text-muted">Customer account</p>
          <h1 className="mt-3 text-h1m lg:text-h1">Your orders and designs, in one place</h1>
          <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-muted">
            Sign in to manage your orders, saved artwork, addresses and size profile.
          </p>
          <div className="mt-8"><AccountAccess /></div>
      </StorefrontShell>
    );
  }

  return (
    <StorefrontShell>
        <div className="container-pe grid gap-8 py-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10 lg:py-10">
          <aside className="min-w-0">
            <div className="flex items-center gap-3 pb-5">
              <span
                aria-hidden
                className="flex h-10 w-10 shrink-0 items-center justify-center bg-lime text-[13px] font-medium text-ink"
              >
                {user.name.split(/\s+/).map(part=>part[0]).join("").slice(0,2).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[15px]">{user.name}</p>
                <p className="truncate text-[13px] text-muted">{user.email}</p>
              </div>
            </div>

            <nav aria-label="Account" className="border-t border-line pt-4 max-lg:hidden">
              <ul>
                {ACCOUNT_NAV.map((n) => {
                  const on = n.slug === active;
                  return (
                    <li key={n.slug}>
                      <Link
                        href={n.href}
                        aria-current={on ? "page" : undefined}
                        className={
                          "block border-l-2 px-4 py-2.5 text-[14px] transition-colors " +
                          (on
                            ? "border-lime bg-alt text-ink"
                            : "border-transparent text-muted hover:text-ink")
                        }
                      >
                        {n.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-4 border-t border-line pt-4">
                <SignOutButton />
              </div>
            </nav>

            <nav aria-label="Account" className="no-scrollbar -mx-6 overflow-x-auto border-y border-line lg:hidden">
              <ul className="flex px-6">
                {ACCOUNT_NAV.map((n) => {
                  const on = n.slug === active;
                  return (
                    <li key={n.slug} className="shrink-0">
                      <Link
                        href={n.href}
                        aria-current={on ? "page" : undefined}
                        className={
                          "block border-b-2 px-4 py-3 text-[14px] " +
                          (on ? "border-lime text-ink" : "border-transparent text-muted")
                        }
                      >
                        {n.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>

          <div className="min-w-0">
            <h1 className="text-[26px] font-medium tracking-[-0.02em] lg:text-[32px]">{title}</h1>
            {subtitle && <p className="mt-1.5 text-[14px] text-muted">{subtitle}</p>}
            <div className="mt-7">{children}</div>
          </div>
        </div>
    </StorefrontShell>
  );
}
