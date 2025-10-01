// apps/web/src/lib/fhir.ts
import { set, get } from "idb-keyval";

const QUEUE_KEY = "fhirQueue:v1";

function base() {
  // .env.local: VITE_FHIR_BASE_URL=http://localhost:8080/fhir
  return import.meta.env.VITE_FHIR_BASE_URL?.trim();
}
function onlineFHIR() {
  const b = base();
  return b && b.startsWith("http");
}

async function enqueue(op: any) {
  const q = (await get(QUEUE_KEY)) as any[] | undefined;
  const next = Array.isArray(q) ? [...q, op] : [op];
  await set(QUEUE_KEY, next);
}

export async function trySyncQueue() {
  if (!onlineFHIR()) return;
  const q = (await get(QUEUE_KEY)) as any[] | undefined;
  if (!q?.length) return;
  const ok: any[] = [];
  for (const op of q) {
    try {
      const r = await fetch(base()!, {
        method: "POST",
        headers: { "Content-Type": "application/fhir+json" },
        body: JSON.stringify(op.resource),
      });
      if (!r.ok) throw new Error(await r.text());
      ok.push(op);
    } catch {
      // corta el sync al primer fallo (sin romper)
      break;
    }
  }
  if (ok.length) {
    const rest = q.slice(ok.length);
    await set(QUEUE_KEY, rest);
  }
}

export async function fhirPost(resource: any) {
  if (!onlineFHIR()) {
    await enqueue({ type: "POST", resource });
    return { queued: true };
  }
  const r = await fetch(base()!, {
    method: "POST",
    headers: { "Content-Type": "application/fhir+json" },
    body: JSON.stringify(resource),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

// Helpers comunes
export async function upsertPatient(id: string, data: Partial<any> = {}) {
  const resource = {
    resourceType: "Patient",
    id,
    ...data,
  };
  if (!onlineFHIR()) return enqueue({ type: "PUT", resource }); // simple
  const r = await fetch(`${base()}/Patient/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/fhir+json" },
    body: JSON.stringify(resource),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function saveObservation(patientId: string, loincCode: string, display: string, value: number) {
  const obs = {
    resourceType: "Observation",
    status: "final",
    code: { coding: [{ system: "http://loinc.org", code: loincCode, display }], text: display },
    subject: { reference: `Patient/${patientId}` },
    effectiveDateTime: new Date().toISOString(),
    valueInteger: value,
  };
  return fhirPost(obs);
}

export async function ensureDevice(gtin: string, display = "Dispositivo") {
  const dev = {
    resourceType: "Device",
    status: "active",
    distinctIdentifier: gtin,
    type: { text: display },
    identifier: [{ system: "urn:gtin", value: gtin }],
  };
  return fhirPost(dev);
}

export async function toggleDeviceUse(patientId: string, gtin: string, on: boolean) {
  await ensureDevice(gtin);
  const dus = {
    resourceType: "DeviceUseStatement",
    status: on ? "active" : "completed",
    subject: { reference: `Patient/${patientId}` },
    device: { reference: `Device?identifier=urn:gtin|${gtin}` },
    recordedOn: new Date().toISOString(),
  };
  return fhirPost(dus);
}

export const hasFHIR = !!import.meta.env.VITE_FHIR_BASE_URL?.trim();

async function fhirReq(method: string, path: string, body?: any) {
  const BASE = import.meta.env.VITE_FHIR_BASE_URL?.trim();
  if (!BASE) throw new Error("FHIR BASE no configurado");
  const r = await fetch(`${BASE.replace(/\/$/,'')}/${path}`, {
    method,
    headers: { "Content-Type": "application/fhir+json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json();
}

export async function ensurePatient(id: string) {
  if (!hasFHIR) return;
  const patient = { resourceType: "Patient", id, name: [{ family: "Demo", given: ["Paciente"] }] };
  await fhirReq("PUT", `Patient/${id}`, patient);
}

export async function registerDeviceUse(patientId: string, label: string) {
  if (!hasFHIR) return;
  const device = await fhirReq("POST", "Device", {
    resourceType: "Device",
    status: "active",
    distinctIdentifier: label,
    type: { text: label },
  });
  await fhirReq("POST", "DeviceUseStatement", {
    resourceType: "DeviceUseStatement",
    subject: { reference: `Patient/${patientId}` },
    device:  { reference: `Device/${device.id}` },
    status: "active",
  });
}
