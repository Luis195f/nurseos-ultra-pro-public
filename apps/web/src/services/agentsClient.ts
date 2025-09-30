// src/services/agentsClient.ts
const API = import.meta.env.VITE_AGENTS_API_BASE || "http://localhost:8070";

async function post<T = any>(path: string, body: any): Promise<T> {
  const r = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(`${r.status} ${r.statusText} @ ${path}: ${t}`);
  }
  return r.json();
}

// === Agentes ===
export function runScaleAgent(body: { name: string; answers: any }) {
  return post<{ scale: string; result: any }>("/agents/scale/run", body);
}
export function structureNote(body: { note: string }) {
  return post<{ resources: any[] }>("/agents/doc/structure", body);
}
export function validateBundle(body: { resources: any[] }) {
  return post<{ status: string; issues?: any[] }>("/agents/validate", body);
}
export function abacEval(body: { action: string; resourceType: string; context: any }) {
  return post<{ allow: boolean; reason?: string }>("/agents/abac/eval", body);
}

// === Utilidades de alto nivel (IA resumidora con guardas) ===
export async function aiSummarizeWithGuards(text: string, context?: any) {
  const doc = await structureNote({ note: text });
  // validación opcional (si tienes validador externo configurado no será "skipped")
  let status = "skipped";
  try {
    const v = await validateBundle({ resources: doc.resources });
    status = v.status ?? status;
  } catch {}
  const abac = await abacEval({ action: "create", resourceType: "CarePlan", context: context ?? { role: "nurse" } });
  return { doc, status, abac };
}
