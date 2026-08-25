import { describe,expect,it } from "vitest";
import { requestIsSameOrigin } from "@/lib/security";

describe("same-origin mutation guard",()=>{
  it("accepts browser requests from the application origin",()=>expect(requestIsSameOrigin(new Request("https://printengine.in/api/checkout",{headers:{origin:"https://printengine.in"}}))).toBe(true));
  it("rejects cross-site browser requests",()=>expect(requestIsSameOrigin(new Request("https://printengine.in/api/checkout",{headers:{origin:"https://attacker.example"}}))).toBe(false));
});
