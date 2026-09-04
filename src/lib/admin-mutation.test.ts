import { beforeEach, describe,expect,it,vi } from "vitest";
vi.mock("@/lib/auth",()=>({requireAdmin:vi.fn()}));
import { requireAdmin } from "@/lib/auth";
import { runAdminAction } from "@/lib/admin-mutation";
import { AdminInputError } from "@/lib/admin-validation";
const user={id:"8d0e96a7-9d4d-4d3b-b398-a5bdd24178d1",email:"admin@example.com",name:"Admin",role:"admin" as const};
function form(values:Record<string,string>){const data=new FormData();for(const [key,value] of Object.entries(values))data.set(key,value);return data;}
describe("admin action authorization and feedback",()=>{
  beforeEach(()=>{vi.clearAllMocks();vi.mocked(requireAdmin).mockResolvedValue(user);});
  it("does not execute unauthenticated mutations",async()=>{
    vi.mocked(requireAdmin).mockResolvedValue(null);const op=vi.fn();
    expect((await runAdminAction("toggleDiscount",form({id:user.id}),op)).ok).toBe(false);expect(op).not.toHaveBeenCalled();
  });
  it("restricts staff from changing discounts",async()=>{
    vi.mocked(requireAdmin).mockResolvedValue({...user,role:"staff"});const op=vi.fn();
    expect((await runAdminAction("toggleDiscount",form({id:user.id}),op)).ok).toBe(false);expect(op).not.toHaveBeenCalled();
  });
  it("rejects input before database mutation",async()=>{
    const op=vi.fn();expect((await runAdminAction("updateInventory",form({id:user.id,stock:"-1"}),op)).ok).toBe(false);expect(op).not.toHaveBeenCalled();
  });
  it("allows staff inventory adjustments",async()=>{
    vi.mocked(requireAdmin).mockResolvedValue({...user,role:"staff"});const op=vi.fn().mockResolvedValue(undefined);
    expect((await runAdminAction("updateInventory",form({id:user.id,stock:"2"}),op)).ok).toBe(true);expect(op).toHaveBeenCalledOnce();
  });
  it("returns known validation errors",async()=>{
    const result=await runAdminAction("updateInventory",form({id:user.id,stock:"0"}),async()=>{throw new AdminInputError("Stock is reserved.");});
    expect(result).toEqual({ok:false,message:"Stock is reserved."});
  });
  it("hides database details on a duplicate",async()=>{
    const result=await runAdminAction("toggleDiscount",form({id:user.id}),async()=>{throw {code:"23505",detail:"private database content"};});
    expect(result.ok).toBe(false);expect(result.message).not.toContain("private");
  });
});
