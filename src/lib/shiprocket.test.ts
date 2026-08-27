import { describe, expect, it } from "vitest";
import { normalizedShipmentState } from "@/lib/shiprocket";

describe("Shiprocket tracking status mapping", () => {
  it("maps forward delivery milestones", () => {
    expect(normalizedShipmentState("PICKED UP")).toBe("shipped");
    expect(normalizedShipmentState("IN TRANSIT")).toBe("shipped");
    expect(normalizedShipmentState("OUT FOR DELIVERY")).toBe("shipped");
    expect(normalizedShipmentState("DELIVERED")).toBe("delivered");
  });

  it("does not mistake a returned parcel for a successful delivery", () => {
    expect(normalizedShipmentState("RTO DELIVERED")).toBe("returned");
    expect(normalizedShipmentState("RETURNED TO ORIGIN")).toBe("returned");
  });

  it("preserves pre-dispatch and cancelled states", () => {
    expect(normalizedShipmentState("AWB ASSIGNED")).toBe("processing");
    expect(normalizedShipmentState("CANCELED")).toBe("cancelled");
  });
});
