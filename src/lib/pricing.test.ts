import { describe, expect, it } from "vitest";
import { cartTotals, type CartLine } from "@/lib/pricing";

const line = (qty: number, slug = "classic-half-sleeve-tee"): CartLine => ({
  id: `${slug}-${qty}`,
  slug,
  colour: "Black",
  size: "M",
  method: "Custom print",
  designs: [],
  qty,
});

describe("cartTotals promotions", () => {
  it("keeps an empty cart at zero", () => {
    expect(cartTotals([]).total).toBe(0);
  });

  it("does not apply the automatic offer to one garment", () => {
    expect(cartTotals([line(1)]).adjustments).toEqual([]);
  });

  it("applies 10% off garments when quantity reaches two", () => {
    const totals = cartTotals([line(2)]);
    expect(totals.adjustments[0]).toMatchObject({ id: "buy-2-save-10", amount: 120 });
  });

  it("uses a better coupon instead of stacking it", () => {
    const totals = cartTotals([line(2)], { coupon: "FIRST150" });
    expect(totals.discount).toBe(150);
    expect(totals.adjustments[0].id).toBe("FIRST150");
  });

  it("keeps the automatic offer when it beats the coupon", () => {
    const totals = cartTotals([line(2, "fleece-hoodie")], { coupon: "PRINT250" });
    expect(totals.discount).toBe(260);
    expect(totals.adjustments[0].id).toBe("buy-2-save-10");
  });
});
