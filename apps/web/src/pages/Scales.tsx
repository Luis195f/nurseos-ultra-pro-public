import React, { useState } from "react";

const FHIR = (import.meta as any).env.VITE_FHIR_BASE_URL || "";
const AGENTS = (import.meta as any).env.VITE_AGENTS_API_BASE || "";

type Res = { code:string; score:number; text:string };

function postObs(patientId:string, results:Res[]){
  const now = new Date().toISOString();
  return results.map(r=>({
    resource:{ resourceType:"Observation",
      status:"final",
      subject:{ reference:`Patient/${patientId}` },
      effectiveDateTime: now,
      code:{ text:r.code },
      valueQuantity:{ value:r.score },
      interpretation:[{ text:r.text }],
    },
    request:{ method:"POST", url:"Observation" }
  }));
}

async function saveAll(patientId:string, results:Res[]){
  if(!patientId) throw new Error("Falta Patient ID");
  if(FHIR){
    const bundle = { resourceType:"Bundle", type:"transaction", entry: postObs(patientId, results) };
    const res = await fetch(FHIR, { method:"POST", headers:{ "Content-Type":"application/fhir+json" }, body: JSON.stringify(bundle) });
    if(!res.ok) throw new Error("FHIR " + res.status);
  }else{
    localStorage.setItem(`nurseos/scales/${patientId}/${Date.now()}`, JSON.stringify(results));
  }
  if(AGENTS){
    try{ await fetch(`${AGENTS}/audit/log`,{method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ ts:new Date().toISOString(), user:"nurse-demo", action:"scales.save", resourceType:"Observation", patientId, allow:true, reason:"scales", details:{ codes:results.map(r=>r.code) } })}); }catch(_){}
  }
}

// === Cálculos (simplificados y estándar) ===
function braden(total:number){ // 6-23: <13 alto, 13-14 moderado, 15-18 bajo, >18 mínimo
  let text = total <=12 ? "Riesgo muy alto" : total<=14 ? "Riesgo moderado" : total<=18 ? "Riesgo bajo" : "Riesgo mínimo";
  return { code:"Braden", score: total, text };
}
function morse(total:number){ // >=45 alto; 25-44 moderado; <25 bajo
  let text = total>=45 ? "Alto" : total>=25 ? "Moderado" : "Bajo";
  return { code:"Morse", score: total, text };
}
function barthel(total:number){ // 0-20 total; 21-60 severa; 61-90 moderada; 91-99 leve; 100 independiente
  let t = total<=20?"Dependencia total": total<=60?"Severa": total<=90?"Moderada": total<100?"Leve":"Independiente";
  return { code:"Barthel", score: total, text: t };
}
function charlson(total:number){ // a mayor puntos, mayor mortalidad estimada
  return { code:"Charlson", score: total, text: total>=5?"Alta":"Moderada/Baja" };
}
function norton(total:number){ // <=12 alto, 13-14 medio, >=15 bajo
  let t = total<=12?"Alto": total<=14?"Medio":"Bajo";
  return { code:"Norton", score: total, text: t };
}
function news2(total:number){ // >=7 emergencia; 5-6 alto; 1-4 bajo
  let t = total>=7?"Crítico": total>=5?"Alto":"Bajo";
  return { code:"NEWS2", score: total, text: t };
}
function katz(total:number){ // A(6) independiente → G(1) dependiente total
  let t = total>=6?"A (Independiente)": total===5?"B": total===4?"C": total===3?"D": total===2?"E": total===1?"F":"G (Dependiente total)";
  return { code:"Katz", score: total, text: t };
}
function painNRS(total:number){ // 0-10
  let t = total>=7?"Severo": total>=4?"Moderado": total>=1?"Leve":"Sin dolor";
  return { code:"Dolor NRS", score: total, text: t };
}

export default function Scales(){
  const [patientId, setPatientId] = useState("");
  // inputs mínimos por escala (ajustables)
  const [br, setBr] = useState([3,3,3,3,3,3]); // 1-4 cada ítem
  const [mo, setMo] = useState([0,0,0,0,0,0]); // puntajes de Morse
  const [ba, setBa] = useState(100);          // Barthel total
  const [ch, setCh] = useState(0);
  const [no, setNo] = useState([3,3,3,3,3]);  // Norton: 1-4
  const [nw, setNw] = useState(0);
  const [ka, setKa] = useState(6);
  const [pn, setPn] = useState(0);

  const res: Res[] = [
    braden(br.reduce((a,b)=>a+b,0)),
    morse(mo.reduce((a,b)=>a+b,0)),
    barthel(ba),
    charlson(ch),
    norton(no.reduce((a,b)=>a+b,0)),
    news2(nw),
    katz(ka),
    painNRS(pn),
  ];

  async function onSave(){
    await saveAll(patientId, res);
    alert("✅ Escalas guardadas" + (FHIR? " en FHIR":" (local)"));
  }

  return (
    <section style={{display:"grid", gap:16, maxWidth:980}}>
      <h1>Escalas</h1>
      <div>
        <label>Patient ID</label>
        <input value={patientId} onChange={e=>setPatientId(e.target.value)} style={{marginLeft:8}}/>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:12}}>
        <div style={{border:"1px solid #e5e7eb", borderRadius:10, padding:12}}>
          <h2>Braden</h2>
          <p>Seis ítems (1-4 cada uno). Total 6–23.</p>
          {br.map((v,i)=>
            <div key={i}>Ítem {i+1}: <input type="number" min={1} max={4} value={v} onChange={e=>setBr(br.map((x,k)=>k===i?Number(e.target.value):x))}/></div>
          )}
          <div><b>Resultado:</b> {res[0].score} — {res[0].text}</div>
        </div>

        <div style={{border:"1px solid #e5e7eb", borderRadius:10, padding:12}}>
          <h2>Morse (caídas)</h2>
          <p>Seis ítems. Total ≥45 alto.</p>
          {mo.map((v,i)=>
            <div key={i}>Ítem {i+1}: <input type="number" min={0} max={30} value={v} onChange={e=>setMo(mo.map((x,k)=>k===i?Number(e.target.value):x))}/></div>
          )}
          <div><b>Resultado:</b> {res[1].score} — {res[1].text}</div>
        </div>

        <div style={{border:"1px solid #e5e7eb", borderRadius:10, padding:12}}>
          <h2>Barthel</h2>
          <p>0–100 (100: independiente).</p>
          <input type="number" min={0} max={100} value={ba} onChange={e=>setBa(Number(e.target.value))}/>
          <div><b>Resultado:</b> {res[2].score} — {res[2].text}</div>
        </div>

        <div style={{border:"1px solid #e5e7eb", borderRadius:10, padding:12}}>
          <h2>Charlson</h2>
          <p>Puntaje de comorbilidad (≥5: alta).</p>
          <input type="number" min={0} max={20} value={ch} onChange={e=>setCh(Number(e.target.value))}/>
          <div><b>Resultado:</b> {res[3].score} — {res[3].text}</div>
        </div>

        <div style={{border:"1px solid #e5e7eb", borderRadius:10, padding:12}}>
          <h2>Norton</h2>
          <p>5 ítems (1-4). ≤12 alto.</p>
          {no.map((v,i)=>
            <div key={i}>Ítem {i+1}: <input type="number" min={1} max={4} value={v} onChange={e=>setNo(no.map((x,k)=>k===i?Number(e.target.value):x))}/></div>
          )}
          <div><b>Resultado:</b> {res[4].score} — {res[4].text}</div>
        </div>

        <div style={{border:"1px solid #e5e7eb", borderRadius:10, padding:12}}>
          <h2>NEWS2</h2>
          <p>0–20 (≥7 crítico).</p>
          <input type="number" min={0} max={20} value={nw} onChange={e=>setNw(Number(e.target.value))}/>
          <div><b>Resultado:</b> {res[5].score} — {res[5].text}</div>
        </div>

        <div style={{border:"1px solid #e5e7eb", borderRadius:10, padding:12}}>
          <h2>Katz (ADL)</h2>
          <p>0–6 (A=6 independiente → G).</p>
          <input type="number" min={0} max={6} value={ka} onChange={e=>setKa(Number(e.target.value))}/>
          <div><b>Resultado:</b> {res[6].score} — {res[6].text}</div>
        </div>

        <div style={{border:"1px solid #e5e7eb", borderRadius:10, padding:12}}>
          <h2>Dolor NRS</h2>
          <p>0–10 (≥7 severo).</p>
          <input type="number" min={0} max={10} value={pn} onChange={e=>setPn(Number(e.target.value))}/>
          <div><b>Resultado:</b> {res[7].score} — {res[7].text}</div>
        </div>
      </div>

      <div>
        <button onClick={onSave} style={{padding:"10px 14px", borderRadius:8, background:"#06b6d4", color:"#fff", border:"none"}}>
          Guardar escalas
        </button>
      </div>
    </section>
  );
}
