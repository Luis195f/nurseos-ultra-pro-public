// Cliente FHIR mínimo y helpers “seguros” (no fallan si no hay servidor)
const BASE = (import.meta as any).env?.VITE_FHIR_BASE_URL?.trim?.() || "";

export function hasFHIR(): boolean {
  return !!BASE;
}

// POST genérico
async function fhirPost(resourceType: string, body: any) {
  const res = await fetch(`${BASE}/${resourceType}`, {
    method: "POST",
    headers: { "Content-Type": "application/fhir+json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`FHIR ${resourceType} ${res.status}`);
  return res.json();
}

// Garantiza que el Patient exista (stub amable para demo)
export async function ensurePatient(patientId: string) {
  if (!patientId) return null;
  if (!hasFHIR()) return { id: patientId }; // sin red: no-op amable
  // Intento naive de read; si 404, crea
  const read = await fetch(`${BASE}/Patient/${encodeURIComponent(patientId)}`);
  if (read.ok) return read.json();
  if (read.status !== 404) throw new Error("FHIR Patient read error");
  return fhirPost("Patient", {
    resourceType: "Patient",
    id: patientId,
    identifier: [{ system: "urn:nurseos:id", value: patientId }],
  });
}

// Registra uso de dispositivo (DeviceUseStatement) súper simple
export async function registerDeviceUse(patientId: string, display: string) {
  if (!hasFHIR() || !patientId || !display) return null;
  const body = {
    resourceType: "DeviceUseStatement",
    status: "active",
    subject: { reference: `Patient/${patientId}` },
    device: { display },
    recordedOn: new Date().toISOString(),
  };
  return fhirPost("DeviceUseStatement", body);
}


