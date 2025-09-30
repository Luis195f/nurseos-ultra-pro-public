import React, { useState } from "react";
import catalogData from "./catalogs/comorbidities.es.json";
import { ComorbidityChips } from "./ComorbidityChips";
import { buildFhirBundle } from "./mappers";
import { enqueueBundle, listOutbox, clearOutbox } from "./outbox";
import { sendBundleToFhir } from "../fhir/sendBundle";

type Identifier = { system?:string; value:string };
type Coverage = { payer?:string; plan?:string; memberId?:string };
type Surgery = { label:string; code?:string; date?:string; center?:string };
type Diagnosis = { label:string; code?:string; system?:"snomed"|"icd10" };
type VitalSigns = { sbp?:number; dbp?:number; hr?:number; rr?:number; temp?:number; spo2?:number; pain?:number; glucose?:number; };

const defaultData:any = {
  patient:{ identifiers:[], givenName:"", familyName:"", telecom:[] },
  encounter:{},
  clinical:{ diagnoses:[], comorbidities:[], vitals:{} },
  carePlan:{},
  consents:{ justification: "" } // para OPA/ABAC (X-Justification)
};

export default function RegistryStandalone(){
  const [data, setData] = useState<any>(defaultData);
  const [bundleJson, setBundleJson] = useState<string>("");
  const [query, setQuery] = useState<string>("");

  const update=(key:string, value:any)=> setData((d:any)=>({ ...d, [key]:value }));
  const updatePatient=(k:string, v:any)=> setData((d:any)=>({ ...d, patient:{ ...d.patient, [k]:v }}));
  const updateEncounter=(k:string, v:any)=> setData((d:any)=>({ ...d, encounter:{ ...d.encounter, [k]:v }}));
  const updateClinical=(k:string, v:any)=> setData((d:any)=>({ ...d, clinical:{ ...d.clinical, [k]:v }}));

  const addIdentifier=()=> updatePatient("identifiers",[...(data.patient.identifiers||[]),{system:"",value:""}]);
  const addDiagnosis=()=> updateClinical("diagnoses",[...(data.clinical.diagnoses||[]),{label:"",code:"",system:"snomed"}]);
  const addSurgery=()=> updateClinical("surgeries",[...(data.clinical.surgeries||[]),{label:"",code:"",date:"",center:""}]);

  function buildBundle(){
    if (!data.patient.givenName || !data.patient.familyName) { alert("Nombre y Apellidos son obligatorios."); return; }
    if (data.patient.birthDate && data.encounter.start) {
      if (new Date(data.patient.birthDate) > new Date(data.encounter.start)) { alert("Nacimiento > atención (incoherente)"); return; }
    }
    const bundle = buildFhirBundle(data);
    setBundleJson(JSON.stringify(bundle, null, 2));
  }

  async function saveToOutbox(){
    const id = await enqueueBundle(buildFhirBundle(data));
    alert("Guardado en Outbox: "+id);
  }
  async function showOutbox(){ const items = await listOutbox(); alert("Outbox: "+items.length+" elemento(s)"); }
  async function clearAllOutbox(){ await clearOutbox(); alert("Outbox vaciado"); }

  async function syncNow(){
    try {
      const bundle = buildFhirBundle(data);
      const pFullUrl = bundle.entry?.find((e:any)=> e.resource?.resourceType==="Patient")?.fullUrl as string|undefined;
      const patientId = pFullUrl?.split("/")?.[1]; // para X-Patient-Id (ABAC/OPA)
      const res = await sendBundleToFhir(bundle, { patientId, justification: data?.consents?.justification || "registro inicial" });
      setBundleJson(JSON.stringify(res, null, 2));
      alert("Sincronizado con FHIR ✔");
    } catch (e:any) {
      alert(`Error al sincronizar: ${e?.message || e}`);
    }
  }

  const catalog:any = catalogData as any;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-4">Registro de Pacientes — Enfermería</h1>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Ámbito / Especialidad</h2>
        <div className="grid md:grid-cols-3 gap-2">
          <select className="border rounded p-2" onChange={e=>{
            const val = e.target.value;
            updateEncounter("specialty", val);
            const preset = (catalog?.presets||[]).find((p:any)=>p.id===val);
            if (preset) updateClinical("comorbidities", Array.from(new Set([...(data.clinical.comorbidities||[]), ...preset.include])));
          }}>
            <option value="">Selecciona</option>
            <option value="urgencias">Urgencias</option>
            <option value="uci">UCI</option>
            <option value="geriatria">Geriatría</option>
            <option value="oncologia">Oncología</option>
            <option value="medico-quirurgico">Médico-Quirúrgico</option>
            <option value="seguridad">Seguridad del paciente</option>
          </select>
          <div className="text-sm opacity-70 md:col-span-2">Al elegir especialidad se aplican comorbilidades típicas como preset.</div>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Identificación / Administrativos</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <input placeholder="Nombre" className="border rounded p-2" value={data.patient.givenName} onChange={e=>updatePatient("givenName", e.target.value)} />
          <input placeholder="Apellidos" className="border rounded p-2" value={data.patient.familyName} onChange={e=>updatePatient("familyName", e.target.value)} />
          <select className="border rounded p-2" value={data.patient.gender||""} onChange={e=>updatePatient("gender", e.target.value)}>
            <option value="">Sexo</option><option value="male">Masculino</option><option value="female">Femenino</option><option value="other">Otro</option><option value="unknown">Desconocido</option>
          </select>
          <input type="date" className="border rounded p-2" value={data.patient.birthDate||""} onChange={e=>updatePatient("birthDate", e.target.value)} />
          <input placeholder="Estado civil" className="border rounded p-2" value={data.patient.maritalStatus||""} onChange={e=>updatePatient("maritalStatus", e.target.value)} />
          <input placeholder="Nacionalidad" className="border rounded p-2" value={data.patient.nationality||""} onChange={e=>updatePatient("nationality", e.target.value)} />
          <input placeholder="Nombre del cuidador" className="border rounded p-2 md:col-span-2" value={data.patient.caregiverName||""} onChange={e=>updatePatient("caregiverName", e.target.value)} />
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Identificadores</h3>
            <button type="button" onClick={addIdentifier} className="px-3 py-1 rounded border">Añadir</button>
          </div>
          {(data.patient.identifiers||[]).map((id:Identifier, idx:number)=>(
            <div key={idx} className="grid md:grid-cols-3 gap-2 mb-2">
              <input placeholder="Sistema (MRN, NIF...)" className="border rounded p-2" value={id.system||""} onChange={e=>{
                const next=[...(data.patient.identifiers||[])]; next[idx]={...id, system:e.target.value}; updatePatient("identifiers", next);
              }} />
              <input placeholder="Valor" className="border rounded p-2" value={id.value||""} onChange={e=>{
                const next=[...(data.patient.identifiers||[])]; next[idx]={...id, value:e.target.value}; updatePatient("identifiers", next);
              }} />
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-2 mt-4">
          <input placeholder="Teléfono" className="border rounded p-2" onChange={e=>updatePatient("telecom", [{system:"phone", value:e.target.value}])} />
          <input placeholder="Email" className="border rounded p-2" onChange={e=>updatePatient("telecom", [ ...(data.patient.telecom||[]), {system:"email", value:e.target.value}])} />
          <input placeholder="Idioma preferido (ES, EN...)" className="border rounded p-2" value={data.patient.language||""} onChange={e=>updatePatient("language", e.target.value)} />
        </div>

        <div className="grid md:grid-cols-3 gap-2 mt-4">
          <input placeholder="Contacto emergencia: Nombre" className="border rounded p-2" onChange={e=>updatePatient("emergencyContact", { ...(data.patient.emergencyContact||{}), name: e.target.value})} />
          <input placeholder="Relación" className="border rounded p-2" onChange={e=>updatePatient("emergencyContact", { ...(data.patient.emergencyContact||{}), relationship: e.target.value})} />
          <input placeholder="Teléfono contacto" className="border rounded p-2" onChange={e=>updatePatient("emergencyContact", { ...(data.patient.emergencyContact||{}), phone: e.target.value})} />
        </div>

        <div className="grid md:grid-cols-3 gap-2 mt-4">
          <input placeholder="Aseguradora" className="border rounded p-2" onChange={e=>updatePatient("coverage", { ...(data.patient.coverage||{}), payer: e.target.value})} />
          <input placeholder="Plan" className="border rounded p-2" onChange={e=>updatePatient("coverage", { ...(data.patient.coverage||{}), plan: e.target.value})} />
          <input placeholder="Nº afiliado" className="border rounded p-2" onChange={e=>updatePatient("coverage", { ...(data.patient.coverage||{}), memberId: e.target.value})} />
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Episodio actual</h2>
        <div className="grid md:grid-cols-3 gap-2">
          <input type="datetime-local" className="border rounded p-2" value={data.encounter.start||""} onChange={e=>updateEncounter("start", e.target.value)} />
          <input placeholder="Motivo de consulta" className="border rounded p-2 md:col-span-2" value={data.encounter.reason||""} onChange={e=>updateEncounter("reason", e.target.value)} />
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Clínico base</h2>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Diagnóstico(s) médico(s)</h3>
            <button type="button" onClick={addDiagnosis} className="px-3 py-1 rounded border">Añadir</button>
          </div>
          {(data.clinical.diagnoses||[]).map((dx:Diagnosis, idx:number)=>(
            <div key={idx} className="grid md:grid-cols-4 gap-2 mb-2">
              <input placeholder="Diagnóstico (texto)" className="border rounded p-2 md:col-span-2" list="dx-sug" value={dx.label||""} onChange={e=>{
                const next=[...(data.clinical.diagnoses||[])]; next[idx]={...dx, label:e.target.value}; updateClinical("diagnoses", next);
              }} />
              <select className="border rounded p-2" value={dx.system||"snomed"} onChange={e=>{
                const next=[...(data.clinical.diagnoses||[])]; next[idx]={...dx, system:e.target.value as any}; updateClinical("diagnoses", next);
              }}>
                <option value="snomed">SNOMED</option>
                <option value="icd10">CIE-10-ES</option>
              </select>
              <input placeholder="Código (opcional)" className="border rounded p-2" value={dx.code||""} onChange={e=>{
                const next=[...(data.clinical.diagnoses||[])]; next[idx]={...dx, code:e.target.value}; updateClinical("diagnoses", next);
              }} />
            </div>
          ))}
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Comorbilidades (1-clic) <span className="ml-2 text-xs opacity-70">Sel.: {(data.clinical.comorbidities||[]).length}</span></h3>
            <input placeholder="Buscar…" className="border rounded p-2" value={query} onChange={e=>setQuery(e.target.value)} />
          </div>
          <div className="mt-2">
            <ComorbidityChips selected={data.clinical.comorbidities||[]} onChange={(ids)=>updateClinical("comorbidities", ids)} catalog={catalog} query={query} />
          </div>
        </div>

        <div className="mb-4">
          <h3 className="font-medium">Signos vitales basales</h3>
          <div className="grid md:grid-cols-8 gap-2">
            <input placeholder="PAS" className="border rounded p-2" type="number" onChange={e=>updateClinical("vitals", { ...(data.clinical.vitals||{}), sbp: Number(e.target.value)||undefined })} />
            <input placeholder="PAD" className="border rounded p-2" type="number" onChange={e=>updateClinical("vitals", { ...(data.clinical.vitals||{}), dbp: Number(e.target.value)||undefined })} />
            <input placeholder="FC" className="border rounded p-2" type="number" onChange={e=>updateClinical("vitals", { ...(data.clinical.vitals||{}), hr: Number(e.target.value)||undefined })} />
            <input placeholder="FR" className="border rounded p-2" type="number" onChange={e=>updateClinical("vitals", { ...(data.clinical.vitals||{}), rr: Number(e.target.value)||undefined })} />
            <input placeholder="Temp °C" className="border rounded p-2" type="number" step="0.1" onChange={e=>updateClinical("vitals", { ...(data.clinical.vitals||{}), temp: Number(e.target.value)||undefined })} />
            <input placeholder="SpO₂ %" className="border rounded p-2" type="number" onChange={e=>updateClinical("vitals", { ...(data.clinical.vitals||{}), spo2: Number(e.target.value)||undefined })} />
            <input placeholder="Dolor NRS" className="border rounded p-2" type="number" min={0} max={10} onChange={e=>updateClinical("vitals", { ...(data.clinical.vitals||{}), pain: Number(e.target.value)||undefined })} />
            <input placeholder="Glucemia" className="border rounded p-2" type="number" onChange={e=>updateClinical("vitals", { ...(data.clinical.vitals||{}), glucose: Number(e.target.value)||undefined })} />
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Cirugías previas</h3>
            <button type="button" onClick={addSurgery} className="px-3 py-1 rounded border">Añadir</button>
          </div>
          {(data.clinical.surgeries||[]).map((sx:Surgery, idx:number)=>(
            <div key={idx} className="grid md:grid-cols-4 gap-2 mb-2">
              <input placeholder="Procedimiento" className="border rounded p-2" list="sx-sug" value={sx.label||""} onChange={e=>{
                const next=[...(data.clinical.surgeries||[])]; next[idx]={...sx, label:e.target.value}; updateClinical("surgeries", next);
              }} />
              <input placeholder="Código (SNOMED/CIE-10-PCS)" className="border rounded p-2" value={sx.code||""} onChange={e=>{
                const next=[...(data.clinical.surgeries||[])]; next[idx]={...sx, code:e.target.value}; updateClinical("surgeries", next);
              }} />
              <input type="date" className="border rounded p-2" value={sx.date||""} onChange={e=>{
                const next=[...(data.clinical.surgeries||[])]; next[idx]={...sx, date:e.target.value}; updateClinical("surgeries", next);
              }} />
              <input placeholder="Centro" className="border rounded p-2" value={sx.center||""} onChange={e=>{
                const next=[...(data.clinical.surgeries||[])]; next[idx]={...sx, center:e.target.value}; updateClinical("surgeries", next);
              }} />
            </div>
          ))}
        </div>
      </section>

      <div className="mb-4">
        <h3 className="font-medium">Plan de cuidados (ADPIE) — resumen</h3>
        <textarea
          className="w-full h-28 border rounded p-2"
          placeholder="Dx enfermeros, objetivos, intervenciones, evaluación…"
          onChange={e=>update("carePlan", { summary: e.target.value })}
        />
      </div>

      <div className="mb-4">
        <h3 className="font-medium">Consentimientos y seguridad</h3>
        <input
          className="border rounded p-2 w-full"
          placeholder="Justificación de acceso (se envía en X-Justification)"
          value={data?.consents?.justification || ""}
          onChange={(e)=>update("consents", { ...(data.consents||{}), justification: e.target.value })}
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        <button type="button" onClick={buildBundle} className="px-4 py-2 rounded border">Generar FHIR Bundle</button>
        <button type="button" onClick={syncNow} className="px-4 py-2 rounded border">Sincronizar ahora</button>
        <button type="button" onClick={async()=>{
          const content = bundleJson || JSON.stringify(buildFhirBundle(data), null, 2);
          const blob = new Blob([content], { type: "application/json" });
          const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "patient_registry_bundle.json"; a.click();
        }} className="px-4 py-2 rounded border">Exportar JSON</button>
        <button type="button" onClick={saveToOutbox} className="px-4 py-2 rounded border">Guardar en Outbox</button>
        <button type="button" onClick={showOutbox} className="px-4 py-2 rounded border">Ver Outbox</button>
        <button type="button" onClick={clearAllOutbox} className="px-4 py-2 rounded border">Vaciar Outbox</button>
      </div>

      <div className="mt-4">
        <textarea className="w-full h-64 border rounded p-2 font-mono text-xs" placeholder="FHIR Bundle (JSON / respuesta)" value={bundleJson} readOnly />
      </div>

      <datalist id="dx-sug">
        <option value="Neumonía"/><option value="Insuficiencia cardiaca"/><option value="EPOC reagudizado"/><option value="IAM"/><option value="ACV isquémico"/>
      </datalist>
      <datalist id="sx-sug">
        <option value="Colecistectomía laparoscópica"/><option value="Cesárea"/><option value="Artroplastia de cadera"/><option value="Bypass coronario"/>
      </datalist>
    </div>
  );
}

