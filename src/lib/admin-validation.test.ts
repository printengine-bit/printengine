import { describe,expect,it } from "vitest";
import { adminSchemas,orderUpdateError } from "@/lib/admin-validation";

const id="8d0e96a7-9d4d-4d3b-b398-a5bdd24178d1";
describe("admin input boundaries",()=>{
  it.each(["-1","1.5","NaN","Infinity","","1e9"])("rejects unsafe stock %s",stock=>expect(adminSchemas.updateInventory.safeParse({id,stock}).success).toBe(false));
  it("allows zero stock",()=>expect(adminSchemas.updateInventory.safeParse({id,stock:"0"}).success).toBe(true));
  it("rejects malformed IDs",()=>expect(adminSchemas.toggleDiscount.safeParse({id:"undefined"}).success).toBe(false));
  it("rejects unknown settings and table names",()=>{
    expect(adminSchemas.saveKeyValue.safeParse({table:"users",key:"role",value:"admin"}).success).toBe(false);
    expect(adminSchemas.saveKeyValue.safeParse({table:"settings",key:"SESSION_SECRET",value:"x"}).success).toBe(false);
  });
  it("rejects discounts above 100 percent",()=>expect(adminSchemas.createDiscount.safeParse({name:"Test",code:"",type:"percentage",value:"101",minimumQuantity:"0",minimumSubtotal:"0"}).success).toBe(false));
  it("requires buy and get quantities",()=>{
    const data={name:"Test",code:"",type:"buy_x_get_y",value:"0",minimumQuantity:"0",minimumSubtotal:"0"};
    expect(adminSchemas.createDiscount.safeParse(data).success).toBe(false);
    expect(adminSchemas.createDiscount.safeParse({...data,buyQuantity:"2",getQuantity:"1"}).success).toBe(true);
  });
  it("does not let a status update pretend to issue a refund",()=>expect(adminSchemas.updateOrder.safeParse({id,status:"refunded",fulfillment:"returned",tracking:""}).success).toBe(false));
});
describe("order progression",()=>{
  it("requires paid confirmation",()=>expect(orderUpdateError({status:"pending",payment_status:"pending"},"confirmed","processing","")).toMatch(/Payment/));
  it("rejects backwards moves and skipped stages",()=>{
    expect(orderUpdateError({status:"confirmed",payment_status:"paid"},"pending","unfulfilled","")).toMatch(/one stage/);
    expect(orderUpdateError({status:"confirmed",payment_status:"paid"},"delivered","fulfilled","awb")).toMatch(/one stage/);
  });
  it("requires tracking for shipping",()=>expect(orderUpdateError({status:"in_production",payment_status:"paid"},"shipped","fulfilled","")).toMatch(/tracking/));
  it("allows tracked shipment of a paid production order",()=>expect(orderUpdateError({status:"in_production",payment_status:"paid"},"shipped","fulfilled","awb")).toBeNull());
  it("protects closed orders",()=>expect(orderUpdateError({status:"refunded",payment_status:"refunded"},"confirmed","unfulfilled","")).toMatch(/Closed/));
});
