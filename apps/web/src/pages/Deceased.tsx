import React, { useState } from "react";
const FHIR = (import.meta as any).env.VITE_FHIR_BASE_URL || "";
const AGENTS = (import.meta as any).env.VITE_AGENTS_API_BASE || "";

export default function Deceased(){
  const [patientId, setPatientId] = useState("");
  const [date, setDate] = useState(()=> new Date().toISOString().slice(0,16)); // yyyy-mm-ddThh:mm

  async function onSave(){
    if(!patientId) return alert("Falta Patient ID");
    if(FHIR){
      const bundle = {
        resourceType:"Bundle", type:"transaction", entry:[
          { // marcar fallecido en Patient
            request:{ method:"PATCH", url:`Patient/${patientId}` },
            resource:{ deceasedDateTime: new Date(date).toISOString(), resourceType:"Patient", id: patientId }
          },
          { // DocumentReference para auditoría clínica
            request:{ method:"POST", url:"DocumentReference" },
            resource:{
              resourceType:"DocumentReference",
              status:"current",
              type:{ text:"Fallecimiento" },
              category:[{ text:"deceased" }],
              subject:{ reference:`Patient/${patientId}` },
              date: new Date(date).toISOString(),
              content:[{ attachment:{ contentType:"text/plain", data:btoa("Registro de fallecimiento en NurseOS") } }]
            }
          }
        ]
      };
      const res = await fetch(FHIR, { method:"POST", headers:{ "Content-Type":"application/fhir+json" }, body: JSON.stringify(bundle) });
      if(!res.ok) return alert("FHIR error " + res.status);
    }else{
      localStorage.setItem(`nurseos/deceased/${patientId}`, JSON.stringify({ date }));
    }
    if(AGENTS){
      try{ await fetch(`${AGENTS}/audit/log`,{method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({
        ts:new Date().toISOString(), user:"nurse-demo", action:"deceased.save", resourceType:"Patient", patientId, allow:true, reason:"deceased", details:{ date }
      })}); }catch(_){}
    }
    alert("✅ Fallecimiento registrado");
  }

  return (
    <section style={{display:"grid", gap:12, maxWidth:640}}>
      <h1>Fallecidos</h1>
      <div>
        <label>Patient ID</label>
        <input value={patientId} onChange={e=>setPatientId(e.target.value)} style={{marginLeft:8}}/>
      </div>
      <div>
        <label>Fecha y hora</label>
        <input type="datetime-local" value={date} onChange={e=>setDate(e.target.value)} style={{marginLeft:8}}/>
      </div>
      <button onClick={onSave} style={{padding:"10px 14px", borderRadius:8, background:"#111827", color:"#fff", border:"none"}}>
        Guardar
      </button>
    </section>
  );
}
