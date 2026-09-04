import { afterEach, describe,expect,it,vi } from "vitest";
import { requestIsSameOrigin } from "@/lib/security";

describe("same-origin mutation guard",()=>{
  afterEach(()=>vi.unstubAllEnvs());
  it("accepts the configured HTTPS origin behind Railway HTTP forwarding",()=>{
    vi.stubEnv("PUBLIC_BASE_URL","https://printengine.in");
    vi.stubEnv("NODE_ENV","production");
    expect(requestIsSameOrigin(new Request("http://localhost:8080/api/auth/login",{headers:{origin:"https://printengine.in"}}))).toBe(true);
  });
  it("rejects spoofed forwarded hosts and private origins in production",()=>{
    vi.stubEnv("PUBLIC_BASE_URL","https://printengine.in");
    vi.stubEnv("NODE_ENV","production");
    for(const origin of ["https://attacker.example","http://localhost:8080","https://printengine.in.attacker.example","null"])
      expect(requestIsSameOrigin(new Request("http://localhost:8080/api/auth/login",{headers:{origin,"x-forwarded-host":"attacker.example"}}))).toBe(false);
  });
  it("keeps localhost development usable with a public URL configured",()=>{
    vi.stubEnv("PUBLIC_BASE_URL","https://printengine.in");vi.stubEnv("NODE_ENV","development");
    expect(requestIsSameOrigin(new Request("http://localhost:3000/api/auth/login",{headers:{origin:"http://localhost:3000"}}))).toBe(true);
  });
  it("fails closed on malformed configuration",()=>{
    vi.stubEnv("PUBLIC_BASE_URL","not-a-url");
    expect(requestIsSameOrigin(new Request("http://localhost:3000/api/auth/login",{headers:{origin:"http://localhost:3000"}}))).toBe(false);
  });
  it("rejects a cross-site request without an Origin",()=>expect(requestIsSameOrigin(new Request("https://printengine.in/api/auth/login",{headers:{"sec-fetch-site":"cross-site"}}))).toBe(false));
  it("accepts browser requests from the application origin",()=>expect(requestIsSameOrigin(new Request("https://printengine.in/api/checkout",{headers:{origin:"https://printengine.in"}}))).toBe(true));
  it("rejects cross-site browser requests",()=>expect(requestIsSameOrigin(new Request("https://printengine.in/api/checkout",{headers:{origin:"https://attacker.example"}}))).toBe(false));
});
