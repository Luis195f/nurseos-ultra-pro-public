// src/services/fhirClient.ts
import { DEVICES } from "../data/devices";

const FHIR_BASE: string | undefined = import.meta.env.VITE_FHIR_BASE;

type Patient = {
  resourceType: "Patient";
  id?: string;
  identifier?: { system?: string; value: string }[];
  name?: { use?: string; family?: string; given?: string[] }[];
  gender?: "male" | "female" | "other" | "unknown";
  birthDate?: string;
  telecom?: { system: "phone" | "email"; value: string }[];
  address?: { use?: string; line?: string[]; city?: string; postalCode?: string; country?: string }[];
};

type Device = {
  resourceType: "Device";
  id?: string;
  status?: "active" | "inactive" | "entered-in-error" | "unknown";
  type?: { text?: string };
  patient?: { reference: string };
};

const LS_PAT = "patients.v1";
const LS_DEV = "patientDevices.v1"; // { [patientId]: string[] }
const LS_DOC = "patientDocs.v1";     // { [patientId]: Array<{id,title,category,date,text}> }

function lsGet<T>(k: string, def: T): T { try { return JSON.parse(localStorage.getItem(k) || ""); } catch { return def; } }
function lsSet<T>(k: string, v: T) { localStorage.setItem(k, JSON.stringify(v)); }

// ------- helpers
export function hasFHIR(): boolean { return !!FHIR_BASE; }
function baseUrl(path: string) { return `${FHIR_BASE!.replace(/\/$/, "")}/${path.replace(/^\//, "")}`; }
function safeBtoa(str: string) { return btoa(unescape(encodeURIComponent(str))); }

// ------- Patients
function lsPatients(): Patient[] { return lsGet<Patient[]>(LS_PAT, []); }
function lsPatientsSave(p: Patient) {
  const arr = lsPatients();
  const withId = { ...p, id: p.id ?? `local-${Date.now()}` };
  arr.unshift(withId);
  lsSet(LS_PAT, arr);
  return withId;
}

export async function createPatientFHIR(p: Patient): Promise<Patient> {
  const r = await fetch(baseUrl("Patient"), {
    method: "POST", headers: { "Content-Type": "application/fhir+json" }, body: JSON.stringify(p),
  });
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json();
}
export async function listPatientsFHIR(): Promise<Patient[]> {
  const r = await fetch(baseUrl("Patient?_count=50&_sort=-_lastUpdated"), { headers: { Accept: "application/fhir+json" }});
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  const bundle = await r.json();
  return (bundle.entry || []).map((e: any)=>e.resource).filter((x:any)=>x?.resourceType==="Patient");
}

export async function savePatient(p: Patient): Promise<{ patient: Patient; persisted: "fhir" | "local" }> {
  if (FHIR_BASE) {
    const created = await createPatientFHIR(p);
    return { patient: created, persisted: "fhir" };
  } else {
    const created = lsPatientsSave(p);
    return { patient: created, persisted: "local" };
  }
}
export async function listPatients(): Promise<{ patients: Patient[]; source: "fhir" | "local" }> {
  if (FHIR_BASE) {
    try { return { patients: await listPatientsFHIR(), source: "fhir" }; }
    catch { return { patients: lsPatients(), source: "local" }; }
  }
  return { patients: lsPatients(), source: "local" };
}

// ------- Devices
export async function createDevice(patientId: string, name: string): Promise<Device> {
  if (!FHIR_BASE) throw new Error("FHIR_BASE no definido");
  const dev: Device = { resourceType: "Device", status: "active", type: { text: name }, patient: { reference: `Patient/${patientId}` } };
  const r = await fetch(baseUrl("Device"), {
    method: "POST", headers: { "Content-Type": "application/fhir+json" }, body: JSON.stringify(dev),
  });
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json();
}
export async function listDevices(patientId: string): Promise<string[]> {
  if (FHIR_BASE) {
    const r = await fetch(baseUrl(`Device?patient=Patient/${encodeURIComponent(patientId)}&status=active&_count=100`), {
      headers: { Accept: "application/fhir+json" }
    });
    if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
    const bundle = await r.json();
    const names = (bundle.entry || []).map((e: any)=>e.resource?.type?.text).filter(Boolean);
    return Array.from(new Set(names));
  }
  const map = lsGet<Record<string,string[]>>(LS_DEV, {});
  return Array.from(new Set(map[patientId] || []));
}
export async function saveDevices(patientId: string, devices: string[]): Promise<void> {
  const unique = Array.from(new Set(devices.filter(Boolean)));
  if (FHIR_BASE) {
    for (const d of unique) { await createDevice(patientId, d); }
  } else {
    const map = lsGet<Record<string,string[]>>(LS_DEV, {});
    map[patientId] = Array.from(new Set([...(map[patientId] || []), ...unique]));
    lsSet(LS_DEV, map);
  }
}
export { DEVICES }; // reexport para usar en UI

// ------- Documents (Historial: handover / transfer / discharge / notes)
type DocEntry = { id: string; title: string; category: string; date: string; text: string };

export async function savePatientDocument(patientId: string, category: "handover"|"transfer"|"discharge"|"note", title: string, text: string): Promise<DocEntry> {
  const date = new Date().toISOString();
  if (FHIR_BASE) {
    const resource = {
      resourceType: "DocumentReference",
      status: "current",
      type: { text: category },
      subject: { reference: `Patient/${patientId}` },
      date,
      description: title,
      content: [{ attachment: { contentType: "text/plain", data: safeBtoa(text) } }],
    };
    const r = await fetch(baseUrl("DocumentReference"), { method: "POST", headers: { "Content-Type":"application/fhir+json" }, body: JSON.stringify(resource) });
    if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
    const created = await r.json();
    return { id: created.id || `fhir-${Date.now()}`, title, category, date, text };
  } else {
    const map = lsGet<Record<string,DocEntry[]>>(LS_DOC, {});
    const entry: DocEntry = { id: `local-${Date.now()}`, title, category, date, text };
    map[patientId] = [entry, ...(map[patientId]||[])];
    lsSet(LS_DOC, map);
    return entry;
  }
}

export async function listPatientDocuments(patientId: string, category?: string): Promise<DocEntry[]> {
  if (FHIR_BASE) {
    const q = new URLSearchParams({ subject: `Patient/${patientId}`, _sort: "-date", _count: "100" });
    if (category) q.append("type:text", category);
    const r = await fetch(baseUrl(`DocumentReference?${q.toString()}`), { headers: { Accept: "application/fhir+json" } });
    if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
    const bundle = await r.json();
    const docs: DocEntry[] = (bundle.entry || []).map((e: any) => {
      const d = e.resource;
      const text = (() => {
        try {
          const data = d?.content?.[0]?.attachment?.data;
          return data ? decodeURIComponent(escape(atob(data))) : "";
        } catch { return ""; }
      })();
      return { id: d.id, title: d.description || d.type?.text || "Documento", category: d.type?.text || "note", date: d.date || "", text };
    });
    return docs;
  } else {
    const map = lsGet<Record<string,DocEntry[]>>(LS_DOC, {});
    const arr = map[patientId] || [];
    return category ? arr.filter(d => d.category === category) : arr;
  }
}
