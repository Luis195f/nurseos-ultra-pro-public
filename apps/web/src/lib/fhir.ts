const BASE = import.meta.env.VITE_FHIR_BASE_URL?.trim();
export const hasFHIR = !!BASE;

async function req(method: string, path: string, body?: any) {
  if (!BASE) throw new Error("FHIR BASE no configurado");
  const r = await fetch(`${BASE.replace(/\/$/,'')}/${path}`, {
    method, headers: { "Content-Type": "application/fhir+json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json();
}

export async function ensurePatient(id: string) {
  if (!hasFHIR) return;
  const patient = { resourceType: "Patient", id, name: [{ family: "Demo", given: ["Paciente"] }] };
  await req("PUT", `Patient/${id}`, patient);
}

export async function registerDeviceUse(patientId: string, label: string) {
  if (!hasFHIR) return;
  const device = await req("POST", "Device", {
    resourceType: "Device", status: "active", distinctIdentifier: label, type: { text: label }
  });
  await req("POST", "DeviceUseStatement", {
    resourceType: "DeviceUseStatement",
    subject: { reference: `Patient/${patientId}` },
    device:  { reference: `Device/${device.id}` },
    status: "active"
  });
}

