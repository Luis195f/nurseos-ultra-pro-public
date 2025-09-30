import React,{useState} from "react";
import { sendBundleToFhir } from "../fhir/sendBundle";
const FHIR_BASE = import.meta.env.VITE_FHIR_BASE_URL as string | undefined;
const API = import.meta.env.VITE_AGENTS_API_BASE || "http://localhost:8070";
type MR = any;
async function fetchActiveMR(patientId:string):Promise<MR[]>{ if(!FHIR_BASE) return []; const q=new URLSearchParams({subject:`Patient/${patientId}`,status:"active"}).toString(); const r=await fetch(`${FHIR_BASE}/MedicationRequest?${q}`,{headers:{"Accept":"application/fhir+json"}}); const b=await r.json(); return (b.entry||[]).map((e:any)=>e.resource); }
function dueNow(mr:any){ return !!mr?.dosageInstruction?.[0]?.timing; }
export default function BCMAHospital(){
  const [patientId,setPatientId]=useState(""); const [code,setCode]=useState(""); const [status,setStatus]=useState("Esperando datos…");
  async function validateAndAdminister(){
    if(!patientId||!code){ setStatus("Completa Patient.id y Código"); return; }
    setStatus("Buscando órdenes activas…"); const mrs=await fetchActiveMR(patientId);
    let match:any=null;
    for(const mr of mrs){
      const medRef=mr.medicationReference?.reference; const medText=mr.medicationCodeableConcept?.text||""; const codings=mr.medicationCodeableConcept?.coding||[];
      if(codings.some((c:any)=>c.code===code)){ match=mr; break; }
      if(medText && medText.includes(code)){ match=mr; break; }
      if(medRef && code && medRef.endsWith("/"+code)){ match=mr; break; }
    }
    if(!match){ setStatus("❌ No coincide con ninguna MedicationRequest activa."); await fetch(`${API}/audit/log`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({ts:new Date().toISOString(),user:"demo-nurse",action:"BCMA-validate",resourceType:"MedicationRequest",patientId,allow:false,reason:"No match"})}); return; }
    const dose=match.dosageInstruction?.[0]?.doseAndRate?.[0]?.doseQuantity?.value; const route=match.dosageInstruction?.[0]?.route?.text||match.dosageInstruction?.[0]?.route?.coding?.[0]?.code||"oral";
    const okTime=dueNow(match), okDose=!!dose, okRoute=!!route;
    if(!(okTime&&okDose&&okRoute)){ setStatus(`⚠️ Falta info para 5-rights. Hora:${okTime?'OK':'?'} Dosis:${okDose?'OK':'?'} Vía:${okRoute?'OK':'?'}`); await fetch(`${API}/audit/log`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({ts:new Date().toISOString(),user:"demo-nurse",action:"BCMA-validate",resourceType:"MedicationRequest",patientId,allow:false,reason:"Incomplete rights"})}); return; }
    if(!FHIR_BASE){ setStatus("Configura VITE_FHIR_BASE_URL"); return; }
    const bundle={resourceType:"Bundle",type:"transaction",entry:[{request:{method:"POST",url:"MedicationAdministration"},resource:{resourceType:"MedicationAdministration",status:"completed",subject:{reference:`Patient/${patientId}`},effectiveDateTime:new Date().toISOString(),medicationCodeableConcept:match.medicationCodeableConcept||{text:"Medicamento escaneado"},performer:[{actor:{display:"Enfermería demo"}}],dosage:{text:`${dose||''} ${route||''}`.trim(),route:match.dosageInstruction?.[0]?.route},supportingInformation:[{reference:`MedicationRequest/${match.id}`}]}}]};
    try{ await sendBundleToFhir(bundle,{patientId,justification:"BCMA hospital-grade demo"}); setStatus("✅ Administración registrada (MedicationAdministration)."); await fetch(`${API}/audit/log`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({ts:new Date().toISOString(),user:"demo-nurse",action:"BCMA-admin",resourceType:"MedicationAdministration",patientId,allow:true,reason:"OK"})}); }
    catch(e:any){ setStatus("❌ Error registrando en FHIR: "+(e?.message||String(e))); await fetch(`${API}/audit/log`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({ts:new Date().toISOString(),user:"demo-nurse",action:"BCMA-admin",resourceType:"MedicationAdministration",patientId,allow:false,reason:"FHIR error"})}); }
  }
  return (<section style={{display:"grid",gap:12}}><h1>BCMA Hospital-Grade</h1><p style={{color:"var(--muted)"}}>Verificación de 5-rights y registro de MedicationAdministration.</p>
    <div style={{display:"grid",gap:8,maxWidth:520}}>
      <label>Patient.id<input value={patientId} onChange={e=>setPatientId(e.target.value)} placeholder="Ej. P001"/></label>
      <label>Código de medicación<input value={code} onChange={e=>setCode(e.target.value)} placeholder="GTIN/NDC/Ref"/></label>
      <button onClick={validateAndAdminister}>Validar y Administrar</button>
      <div role="status" aria-live="polite" style={{padding:10,background:"var(--soft)",borderRadius:8}}>{status}</div>
    </div></section>);
}
