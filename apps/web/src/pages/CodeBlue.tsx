import React, { useState } from "react";
const AGENTS = (import.meta as any).env.VITE_AGENTS_API_BASE || "";

export default function CodeBlue(){
  const [patientId, setPatientId] = useState("");
  const [note, setNote] = useState("");

  async function onLog(){
    if(AGENTS){
      try{ await fetch(`${AGENTS}/audit/log`,{method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({
        ts:new Date().toISOString(), user:"nurse-demo", action:"codeblue.trigger", resourceType:"Emergency", patientId, allow:true, reason:"code-blue", details:{ note }
      })}); }catch(_){}
    }
    alert("🚨 Código Azul registrado (auditoría). Revise protocolos locales.");
  }

  return (
    <section style={{display:"grid", gap:12, maxWidth:640}}>
      <h1 style={{color:"#8a0010"}}>CÓDIGO AZUL</h1>
      <div>
        <label>Patient ID</label>
        <input value={patientId} onChange={e=>setPatientId(e.target.value)} style={{marginLeft:8}}/>
      </div>
      <div>
        <label>Nota</label>
        <input value={note} onChange={e=>setNote(e.target.value)} placeholder="p.ej., PCR presenciada" style={{marginLeft:8, width:"100%"}}/>
      </div>
      <button onClick={onLog} style={{padding:"10px 14px", borderRadius:8, background:"#b91c1c", color:"#fff", border:"none"}}>
        Registrar Código Azul
      </button>
      <p style={{fontSize:12, color:"#6b7280"}}>No sustituye a los protocolos institucionales. Revisión humana obligatoria.</p>
    </section>
  );
}
