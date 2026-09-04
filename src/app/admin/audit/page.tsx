import AdminShell from "@/components/admin/AdminShell";
import { adminPageUser } from "@/lib/admin";
import { db } from "@/lib/db";

export default async function Page(){
  const user=await adminPageUser();
  if(user.role!=="admin")return <AdminShell title="Audit log" active="/admin/audit"><p>Only administrators can view audit logs.</p></AdminShell>;
  const rows=await db()<Array<{id:string;action:string;entity_type:string;entity_id:string|null;email:string|null;created_at:Date}>>`SELECT a.id,a.action,a.entity_type,a.entity_id,u.email,a.created_at FROM audit_logs a LEFT JOIN users u ON u.id=a.actor_id ORDER BY a.created_at DESC LIMIT 200`;
  return <AdminShell title="Audit log" active="/admin/audit"><p className="mb-4 text-muted">Latest 200 recorded administrative actions. Read-only.</p><div className="overflow-x-auto border border-line bg-white"><table className="w-full min-w-[650px] text-left text-[13px]"><thead><tr>{["Time","Administrator","Action","Record"].map(x=><th className="p-4" key={x}>{x}</th>)}</tr></thead><tbody>{rows.map(x=><tr key={x.id} className="border-t border-line"><td className="p-4">{new Date(x.created_at).toISOString()}</td><td className="p-4">{x.email??"Removed account"}</td><td className="p-4">{x.action}</td><td className="p-4">{x.entity_type} · {x.entity_id??"—"}</td></tr>)}</tbody></table>{!rows.length&&<p className="p-5">No administrative actions recorded yet.</p>}</div></AdminShell>;
}
