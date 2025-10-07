import { describe, it, expect } from "vitest";
import { calculate } from "./news2";

describe("NEWS2", () => {
  it("baja", () => {
    const r = calculate({ rr: 16, spo2: 98, sbp: 120, hr: 80, temp: 36.8, avpu: "A", o2: false });
    expect(r.band).toBe("baja");
  });
  it("alta", () => {
    const r = calculate({ rr: 30, spo2: 90, sbp: 85, hr: 140, temp: 34, avpu: "P", o2: true });
    expect(r.band).toBe("alta");
  });
});
