import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";

const nav = [
  ["Overview", "/admin"],
  ["Products", "/admin/products"],
  ["Inventory", "/admin/inventory"],
  ["Orders", "/admin/orders"],
  ["Customers", "/admin/customers"],
  ["Discounts", "/admin/discounts"],
  ["Artwork", "/admin/artwork"],
  ["Content", "/admin/content"],
  ["Settings", "/admin/settings"],
] as const;

export default async function AdminShell({ title, active, children }: { title: string; active: string; children: React.ReactNode }) {
  const user = await requireAdmin();
  if (!user) redirect("/admin/login");
  return (
    <div className="min-h-screen bg-[#f4f5f1] text-ink">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-ink text-white">
        <div className="flex h-16 items-center justify-between px-5 lg:px-8">
          <Link href="/admin" className="flex items-center gap-2.5" aria-label="PrintEngine administration">
            <Image src="/brand/printengine-dark.png" alt="PrintEngine" width={500} height={200} className="h-auto w-[122px]" />
            <span className="border-l border-white/25 pl-2.5 text-[12px] uppercase tracking-[0.1em] text-white/60">Admin</span>
          </Link>
          <div className="flex items-center gap-4 text-[12px] text-white/65"><span>{user.name}</span><Link href="/" className="text-white underline underline-offset-4">View store</Link></div>
        </div>
      </header>
      <div className="lg:grid lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="border-b border-line bg-white lg:min-h-[calc(100vh-64px)] lg:border-b-0 lg:border-r">
          <nav className="no-scrollbar flex overflow-x-auto p-3 lg:sticky lg:top-16 lg:block lg:p-4">
            {nav.map(([label, href]) => (
              <Link key={href} href={href} className={`shrink-0 px-4 py-2.5 text-[13px] lg:block ${active === href ? "bg-lime text-ink" : "text-muted hover:bg-alt hover:text-ink"}`}>{label}</Link>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 p-5 lg:p-8">
          <div className="mx-auto max-w-7xl"><h1 className="text-[28px] font-medium tracking-[-0.03em] lg:text-[34px]">{title}</h1><div className="mt-7">{children}</div></div>
        </main>
      </div>
    </div>
  );
}
