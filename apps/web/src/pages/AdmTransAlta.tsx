import React, { useState } from "react";
import { sendBundleToFhir } from "../fhir/sendBundle";

export default function AdmTransAlta(){
  const [tab, setTab] = useState<"adm"|"tras"|"alta"|"morgue"|"codeblue">("adm");
  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-3">Admisiones / Traslados / Altas / Morgue / Código Azúl</h1>
      <div className="flex gap-2 mb-4">
        {["adm","tras","alta","morgue","codeblue"].map(t=>
          <button key={t} className={`border rounded px-3 py-1 ${tab===t?"bg-black text-white":""}`} onClick={()=>setTab(t as any)}>
            {t==="adm"?"Admisión":t==="tras"?"Traslado":t==="alta"?"Alta":t==="morgue"?"Morgue/Legal":"Código Azúl"}
          </button>
        )}
      </div>
      {tab==="adm" && <AdmisForm/>}
      {tab==="tras" && <TrasForm/>}
      {tab==="alta" && <AltaForm/>}
      {tab==="morgue" && <MorgueForm/>}
      {tab==="codeblue" && <CodeBlueForm/>}
    </div>
  );
}

function AdmisForm(){
  const [pid,setPid]=useState("");
  async function submit(){
    const b = { resourceType:"Bundle", type:"transaction", entry:[
      { resource:{ resourceType:"EpisodeOfCare", status:"active", patient:{reference:`Patient/${pid}`}}, request:{method:"POST", url:"EpisodeOfCare"} },
      { resource:{ resourceType:"Encounter", status:"in-progress", subject:{reference:`Patient/${pid}`}, period:{ start:new Date().toISOString()}}, request:{method:"POST", url:"Encounter"} }
    ]};
    await sendBundleToFhir(b, { patientId: pid, justification: "admission" });
    alert("Admisión registrada ✅");
  }
  return (
    <div className="space-y-2">
      <input className="border rounded p-2" placeholder="Patient ID" value={pid} onChange={e=>setPid(e.target.value)}/>
      <button className="border rounded px-3 py-1" onClick={submit}>Registrar admisión</button>
    </div>
  );
}

function TrasForm(){
  const [pid,setPid]=useState(""); const [fromU,setFrom]=useState(""); const [toU,setTo]=useState("");
  async function submit(){
    const b = { resourceType:"Bundle", type:"transaction", entry:[
      { resource:{ resourceType:"CommunicationRequest", status:"active", subject:{reference:`Patient/${pid}`}, reasonCode:[{text:"Traslado"}], note:[{text:`${fromU} → ${toU}`} ]}, request:{method:"POST", url:"CommunicationRequest"} },
      { resource:{ resourceType:"Task", status:"requested", intent:"order", description:`Traslado ${fromU} → ${toU}`, for:{reference:`Patient/${pid}`}}, request:{method:"POST", url:"Task"} }
    ]};
    await sendBundleToFhir(b, { patientId: pid, justification: "transfer" });
    alert("Traslado solicitado ✅");
  }
  return (
    <div className="grid md:grid-cols-3 gap-2">
      <input className="border rounded p-2" placeholder="Patient ID" value={pid} onChange={e=>setPid(e.target.value)}/>
      <input className="border rounded p-2" placeholder="Desde unidad" value={fromU} onChange={e=>setFrom(e.target.value)}/>
      <input className="border rounded p-2" placeholder="Hacia unidad" value={toU} onChange={e=>setTo(e.target.value)}/>
      <button className="border rounded px-3 py-1 md:col-span-3" onClick={submit}>Solicitar traslado</button>
    </div>
  );
}

function AltaForm(){
  const [pid,setPid]=useState(""); const [edu,setEdu]=useState("");
  async function submit(){
    const b = { resourceType:"Bundle", type:"transaction", entry:[
      { resource:{ resourceType:"CarePlan", status:"completed", intent:"plan", title:"Educación de alta", description:edu, subject:{reference:`Patient/${pid}`}}, request:{method:"POST", url:"CarePlan"} },
      { resource:{ resourceType:"Encounter", status:"finished", subject:{reference:`Patient/${pid}`}, period:{ end:new Date().toISOString()}}, request:{method:"POST", url:"Encounter"} }
    ]};
    await sendBundleToFhir(b, { patientId: pid, justification: "discharge" });
    alert("Alta registrada ✅");
  }
  return (
    <div className="space-y-2">
      <input className="border rounded p-2" placeholder="Patient ID" value={pid} onChange={e=>setPid(e.target.value)}/>
      <textarea className="border rounded p-2 w-full h-28" placeholder="Educación de enfermería / indicaciones de alta" value={edu} onChange={e=>setEdu(e.target.value)}/>
      <button className="border rounded px-3 py-1" onClick={submit}>Registrar alta</button>
    </div>
  );
}

function MorgueForm(){
  const [pid,setPid]=useState(""); const [notes,setNotes]=useState("");
  async function submit(){
    const b = { resourceType:"Bundle", type:"transaction", entry:[
      { resource:{ resourceType:"Observation", status:"final", code:{text:"Fallecimiento"}, valueString:"Defunción confirmada", subject:{reference:`Patient/${pid}`}, effectiveDateTime:new Date().toISOString() }, request:{method:"POST", url:"Observation"} },
      { resource:{ resourceType:"CommunicationRequest", status:"active", subject:{reference:`Patient/${pid}`}, reasonCode:[{text:"Notificación Fallecimiento"}], note:[{text:notes}] }, request:{method:"POST", url:"CommunicationRequest"} },
      { resource:{ resourceType:"Task", status:"requested", intent:"order", description:"Aviso a Morgue/Legal/Anatomía Patológica", for:{reference:`Patient/${pid}`}}, request:{method:"POST", url:"Task"} }
    ]};
    await sendBundleToFhir(b, { patientId: pid, justification: "death-notification" });
    alert("Notificación de defunción registrada ✅");
  }
  return (
    <div className="space-y-2">
      <input className="border rounded p-2" placeholder="Patient ID" value={pid} onChange={e=>setPid(e.target.value)}/>
      <textarea className="border rounded p-2 w-full h-28" placeholder="Notas / instrucciones" value={notes} onChange={e=>setNotes(e.target.value)}/>
      <button className="border rounded px-3 py-1" onClick={submit}>Notificar defunción</button>
    </div>
  );
}

function CodeBlueForm(){
  const [pid,setPid]=useState("");
  async function submit(){
    const b = { resourceType:"Bundle", type:"transaction", entry:[
      { resource:{ resourceType:"CommunicationRequest", status:"active", subject:{reference:`Patient/${pid}`}, reasonCode:[{text:"Código Azúl"}], note:[{text:"Emergencia activada"}] }, request:{method:"POST", url:"CommunicationRequest"} },
      { resource:{ resourceType:"Task", status:"requested", intent:"filler-order", description:"Responder a Código Azúl", for:{reference:`Patient/${pid}`}}, request:{method:"POST", url:"Task"} }
    ]};
    await sendBundleToFhir(b, { patientId: pid, justification: "emergency" });
    alert("Código Azúl activado ✅");
    // Notificación local
    if ("Notification" in window && Notification.permission !== "denied") {
      Notification.requestPermission().then(()=> new Notification("Código Azúl activado"));
    }
  }
  return (
    <div className="space-y-2">
      <input className="border rounded p-2" placeholder="Patient ID" value={pid} onChange={e=>setPid(e.target.value)}/>
      <button className="border rounded px-3 py-1" onClick={submit}>Activar Código Azúl</button>
    </div>
  );
}
