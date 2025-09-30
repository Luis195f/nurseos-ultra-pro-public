import { authFetch } from "../security/authFetch";

export async function sendBundleToFhir(bundle: any, opt?: { patientId?: string; justification?: string }) {
  const base = import.meta.env.VITE_FHIR_BASE_URL as string;
  const reqId = (globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2));
  const res = await authFetch(base, {
    method: "POST",
    headers: {
      "Content-Type": "application/fhir+json",
      "Prefer": "return=representation",
      "X-Request-Id": reqId,
    },
    body: JSON.stringify(bundle),
  }, { patientId: opt?.patientId, purposeOfUse: "TREAT", justification: opt?.justification });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`FHIR error ${res.status}: ${txt}`);
  }
  return await res.json();
}
