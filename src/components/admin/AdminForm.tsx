"use client";

import { useActionState, type ReactNode } from "react";
import type { AdminActionResult } from "@/lib/admin-validation";

export default function AdminForm({action,children,className}:{action:(form:FormData)=>Promise<AdminActionResult>;children:ReactNode;className?:string}) {
  const [state,submit,pending]=useActionState(async (_:AdminActionResult|null,form:FormData)=>action(form),null);
  return <form action={submit} aria-busy={pending}>
    <fieldset disabled={pending} className={`${className??""} min-w-0 disabled:opacity-60`}>{children}</fieldset>
    {(pending||state)&&<p role={state&&!state.ok?"alert":"status"} aria-live="polite" className={`mt-2 text-[13px] ${state&&!state.ok?"text-[#a32d2d]":"text-muted"}`}>{pending?"Saving…":state?.message}</p>}
  </form>;
}
