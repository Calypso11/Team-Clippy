import { describe, expect, it } from "vitest";
import { sameDimension, toBase, unitLabel } from "./units";

describe("toBase", () => {
  it("keeps lb as lb", () => expect(toBase(5, "lb")).toEqual({ qty: 5, baseUnit: "lb" }));
  it("converts oz to lb", () => expect(toBase(32, "oz")).toEqual({ qty: 2, baseUnit: "lb" }));
  it("converts kg to lb", () => {
    const r = toBase(10, "kg");
    expect(r.baseUnit).toBe("lb");
    expect(r.qty).toBeCloseTo(22.0462, 4);
  });
  it("converts g to lb", () => {
    const r = toBase(453.592, "g");
    expect(r.baseUnit).toBe("lb");
    expect(r.qty).toBeCloseTo(1, 6);
  });
  it("keeps fl_oz as fl_oz", () => expect(toBase(12, "fl_oz")).toEqual({ qty: 12, baseUnit: "fl_oz" }));
  it("converts gal to fl_oz", () => expect(toBase(2, "gal")).toEqual({ qty: 256, baseUnit: "fl_oz" }));
  it("converts l to fl_oz", () => {
    const r = toBase(1, "l");
    expect(r.baseUnit).toBe("fl_oz");
    expect(r.qty).toBeCloseTo(33.814, 3);
  });
  it("converts ml to fl_oz", () => {
    const r = toBase(29.5735, "ml");
    expect(r.baseUnit).toBe("fl_oz");
    expect(r.qty).toBeCloseTo(1, 6);
  });
  it("keeps each as each", () => expect(toBase(1000, "each")).toEqual({ qty: 1000, baseUnit: "each" }));
});

describe("sameDimension", () => {
  it("weight units match", () => expect(sameDimension("lb", "g")).toBe(true));
  it("volume units match", () => expect(sameDimension("gal", "ml")).toBe(true));
  it("weight and volume differ", () => expect(sameDimension("lb", "fl_oz")).toBe(false));
  it("each and weight differ", () => expect(sameDimension("each", "kg")).toBe(false));
});

describe("unitLabel", () => {
  it("lb", () => expect(unitLabel("lb", "Flour")).toBe("per lb"));
  it("fl_oz", () => expect(unitLabel("fl_oz", "Olive oil")).toBe("per fl oz"));
  it("cup", () => expect(unitLabel("each", "16 oz Paper Cups")).toBe("per cup"));
  it("lid", () => expect(unitLabel("each", "Dome lids")).toBe("per lid"));
  it("napkin", () => expect(unitLabel("each", "Napkin dispenser refill")).toBe("per napkin"));
  it("glove", () => expect(unitLabel("each", "Nitrile Gloves L")).toBe("per glove"));
  it("falls back to item", () => expect(unitLabel("each", "Straws")).toBe("per item"));
  it("does not match cup inside cupcake", () => expect(unitLabel("each", "Cupcake liners")).toBe("per item"));
});
