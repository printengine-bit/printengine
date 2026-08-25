import { describe,expect,it } from "vitest";
import { detectedImageType } from "@/lib/image-upload";

describe("artwork file validation",()=>{
  it("detects supported raster signatures",()=>{
    expect(detectedImageType(Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]))).toBe("image/png");
    expect(detectedImageType(Buffer.from([0xff,0xd8,0xff,0xe0]))).toBe("image/jpeg");
    expect(detectedImageType(Buffer.from("RIFF1234WEBP","ascii"))).toBe("image/webp");
  });
  it("rejects SVG and renamed arbitrary files",()=>{
    expect(detectedImageType(Buffer.from("<svg><script>alert(1)</script></svg>"))).toBeNull();
    expect(detectedImageType(Buffer.from("not an image"))).toBeNull();
  });
});
