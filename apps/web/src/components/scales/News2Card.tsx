import { useMemo, useState } from "react";
import { saveObservation } from "@/lib/fhir";

type Vitals = { rr?: number; spo2?: number; temp?: number; sbp?: number; hr?: number; avpu?: "A"|"V"|"P"|"U" };
const loincNEWS2 = { code: "11039-5", display: "NEWS2 total score" };

function scoreNEWS2(v: Vitals) {
  let s = 0;
  const add = (n:number)=>{ s += n; };
  // Respiratory rate
  if (v.rr!=null) { if (v.rr<=8) add(3); else if (v.rr<=11) add(1); else if (v.rr<=20) add(0); else if (v.rr<=24) add(2); else add(3); }
  // SpO2 (escala estándar sin O2 suplementario)
  if (v.spo2!=null) { if (v.spo2<=91) add(3); else if (v.spo2<=93) add(2); else if (v.spo2<=95) add(1); }
  // Temperatura
  if (v.temp!=null) { if (v.temp<=35.0) add(3); else if (v.temp<=36.0) add(1); else if (v.temp<=38.0) add(0); else if (v.temp<=39.0) add(1); else add(2); }
  // Presión sistólica
  if (v.sbp!=null) { if (v.sbp<=90) add(3); else if (v.sbp<=100) add(2); else if (v.sbp<=110) add(1); else if (v.sbp<=219) add(0); else add(3); }
  // Frecuencia cardiaca
  if (v.hr!=null) { if (v.hr<=40) add(3); else if (v.hr<=50) add(1); else if (v.hr<=90) add(0); else if (v.hr<=110) add(1); else if (v.hr<=130) add(2); else add(3); }
  // AVPU
  if (v.avpu) { if (v.avpu==="A") add(0); else add(3); }
  return s;
}

export default function News2Card({ patientId }: { patientId: string }) {
  const [v, setV] = useState<Vitals>({});
  const total = useMemo(()=>scoreNEWS2(v), [v]);

  async function onSave() {
    await saveObservation(patientId, loincNEWS2.code, loincNEWS2.display, total);
    alert("NEWS2 guardado (FHIR o cola offline).");
  }

  return (
    <div className="p-4 rounded-xl border space-y-3">
      <div className="font-semibold">NEWS2</div>
      <div className="grid grid-cols-2 gap-2">
        <input placeholder="RR" type="number" onChange={e=>setV({...v, rr:+e.target.value})} />
        <input placeholder="SpO₂" type="number" onChange={e=>setV({...v, spo2:+e.target.value})} />
        <input placeholder="Temp °C" type="number" step="0.1" onChange={e=>setV({...v, temp:+e.target.value})} />
        <input placeholder="PAS (mmHg)" type="number" onChange={e=>setV({...v, sbp:+e.target.value})} />
        <input placeholder="FC" type="number" onChange={e=>setV({...v, hr:+e.target.value})} />
        <select onChange={e=>setV({...v, avpu:e.target.value as any})}>
          <option value="">AVPU</option><option>A</option><option>V</option><option>P</option><option>U</option>
        </select>
      </div>
      <div className="text-lg">Total: <b>{total}</b></div>
      <button className="px-3 py-2 rounded-lg bg-black text-white" onClick={onSave}>Guardar en FHIR</button>
    </div>
  );
}
