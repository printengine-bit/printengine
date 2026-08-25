import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";

export async function adminPageUser() {
  const user = await requireAdmin();
  if (!user) redirect("/admin/login");
  return user;
}

export const money = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;
export const shortDate = (date: Date | string) => new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
