import { describe, it, expect } from "vitest";
import { buildHandoverBundle } from "./builders";

describe("buildHandoverBundle", () => {
  it("genera Composition + Observations + Provenance", () => {
    const b = buildHandoverBundle(
      { patientId: "p1", authorId: "n1", news2: 6, notes: "ok", invasive: true },
      { priority: "media" }
    );
    expect(b.type).toBe("transaction");
    const types = b.entry.map((e) => e.resource.resourceType);
    expect(types).toContain("Composition");
    expect(types).toContain("Observation");
    expect(types).toContain("Provenance");
  });
});
