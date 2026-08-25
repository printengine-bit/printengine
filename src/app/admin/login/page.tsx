import { redirect } from "next/navigation";
import Image from "next/image";
import AdminLogin from "@/components/admin/AdminLogin";
import { sessionUser } from "@/lib/auth";

export default async function Page() {
  const user = await sessionUser();
  if (user && ["admin", "staff"].includes(user.role)) redirect("/admin");
  return (
    <main className="flex min-h-screen items-center justify-center bg-alt px-6 py-12">
      <section className="w-full max-w-md border border-line bg-white p-7 lg:p-9">
        <Image src="/brand/printengine-light.png" alt="PrintEngine" width={500} height={200} priority className="h-auto w-[156px]" />
        <p className="mt-2 text-[11px] uppercase tracking-[0.12em] text-[#6f8f00]">Operations</p>
        <h1 className="mt-3 text-[32px] font-medium tracking-[-0.03em]">Administration</h1>
        <p className="mt-2 text-[14px] leading-relaxed text-muted">Manage catalogue, orders, inventory, discounts and production artwork.</p>
        <AdminLogin />
      </section>
    </main>
  );
}
