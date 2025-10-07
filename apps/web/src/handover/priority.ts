export type Priority = "baja" | "media" | "alta";

export function computePriority(input: { news2: number; invasive: boolean; falls: boolean; isolation: boolean; }): Priority {
  const base: Priority = input.news2 >= 7 ? "alta" : input.news2 >= 5 ? "media" : "baja";
  const risks = [input.invasive, input.falls, input.isolation].filter(Boolean).length;

  if (risks >= 2) return "alta";
  if (risks === 1) {
    if (base === "baja") return "media";
    if (base === "media") return "alta";
  }
  return base;
}
