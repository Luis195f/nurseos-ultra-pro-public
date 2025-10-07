import { describe, expect, it } from "vitest";
import { computePriority } from "./priority";

describe("computePriority", () => {
  it("LOW when NEWS2=0 y sin riesgos", () => {
    expect(computePriority({ news2: 0, invasive: false, falls: false, isolation: false })).toBe("baja");
  });
  it("MED when NEWS2=5", () => {
    expect(computePriority({ news2: 5, invasive: false, falls: false, isolation: false })).toBe("media");
  });
  it("HIGH when NEWS2=7", () => {
    expect(computePriority({ news2: 7, invasive: false, falls: false, isolation: false })).toBe("alta");
  });
  it("Bump por 1 riesgo", () => {
    expect(computePriority({ news2: 1, invasive: true, falls: false, isolation: false })).toBe("media");
  });
  it(">=2 riesgos → alta", () => {
    expect(computePriority({ news2: 0, invasive: true, falls: true, isolation: false })).toBe("alta");
  });
});
