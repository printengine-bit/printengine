import { requireAdmin } from "@/lib/auth";
import { AdminInputError, adminSchemas, type AdminActionResult } from "@/lib/admin-validation";

export async function runAdminAction(kind:keyof typeof adminSchemas,form:FormData,operation:()=>Promise<void>):Promise<AdminActionResult> {
  try {
    const user=await requireAdmin();
    if(!user)return {ok:false,message:"Your session expired. Sign in as an administrator to continue."};
    if(user.role!=="admin"&&["createProduct","createVariant","updateProduct","createDiscount","toggleDiscount","saveKeyValue"].includes(kind))return {ok:false,message:"Only administrators can change catalogue, discounts or store settings."};
    const result=adminSchemas[kind].safeParse(Object.fromEntries(form));
    if(!result.success)return {ok:false,message:result.error.issues.map(x=>x.message).join(" ")};
    await operation();
    return {ok:true,message:"Saved successfully."};
  } catch(error) {
    if(error instanceof AdminInputError)return {ok:false,message:error.message};
    const code=error&&typeof error==="object"&&"code" in error?String(error.code):"";
    if(code==="23505")return {ok:false,message:"That slug, SKU or discount code already exists."};
    if(code==="23503")return {ok:false,message:"The related record no longer exists. Refresh and try again."};
    // Do not send database details, provider responses or credentials to clients.
    console.error("Admin mutation failed",{kind,code});
    return {ok:false,message:"The operation could not be completed. Refresh to check its current state before retrying."};
  }
}
