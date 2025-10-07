import { get, set } from "idb-keyval";
import { sendBundleToFhir } from "../fhir/sendBundle";

const KEY = "nurseos_outbox_bundles";
export type OutboxItem = { id:string; createdAt:string; payload:any; synced?:boolean; };

export async function enqueueBundle(payload:any){
  const id = Math.random().toString(36).slice(2);
  const createdAt = new Date().toISOString();
  const current:OutboxItem[] = (await get(KEY)) || [];
  current.push({ id, createdAt, payload, synced:false });
  await set(KEY, current);
  return id;
}
export async function listOutbox(){ return (await get(KEY)) || []; }
export async function clearOutbox(){ await set(KEY, []); }

export async function flushOutbox() {
  const items:OutboxItem[] = (await get(KEY)) || [];
  const remaining:OutboxItem[] = [];
  for (const it of items) {
    try {
      const patientId = it.payload?.entry?.find((e:any)=>e.resource?.resourceType==="Patient")?.fullUrl?.split("/")[1];
      await sendBundleToFhir(it.payload, { patientId, justification: "sync-outbox" });
    } catch (e) {
      remaining.push(it); // quedará para reintento
    }
  }
  await set(KEY, remaining);
}

export function installOutboxSync() {
  window.addEventListener("online", () => { flushOutbox(); });
}
