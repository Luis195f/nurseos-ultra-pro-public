import React, { useEffect, useState } from "react";
import { authFetch } from "../security/authFetch";

type HRow = { id:string; name:string; unit?:string; priority:number; alerts:string[] };

function computePriority(p:any){
  let score = 0;
  if (p.flags?.endOfLife) score += 50;
  if (p.flags?.fallsRisk) score += 20;
  if (p.scales?.news2 >= 5) score += 30;
  if (p.vitals?.spo2 && p.vitals.spo2 < 90) score += 20;
  if (p.vitals?.hr && (p.vitals.hr < 50 || p.vitals.hr > 110)) score += 10;
  return score;
}

export default function HandoverBoard(){
  const [rows, setRows] = useState<HRow[]>([]);

  useEffect(()=>{
    (async()=>{
      // Demo: consulta rápida de FHIR (top N por _lastUpdated). En real: incluir Unit.
      const base = import.meta.env.VITE_FHIR_BASE_URL as string;
      const p = await authFetch(`${base}/Patient?_sort=-_lastUpdated&_count=20`);
      if (p.ok){
        const data = await p.json();
        const rows:HRow[] = (data.entry||[]).map((e:any)=>{
          const r = e.resource;
          const fake = { flags:{ fallsRisk:false, endOfLife:false }, scales:{news2:0}, vitals:{spo2:97, hr:80} };
          const priority = computePriority(fake);
          const alerts = [
            ...(fake.flags.fallsRisk?["Riesgo de caídas"]:[]),
            ...(fake.flags.endOfLife?["LET/ETT"]:[]),
            ...(fake.scales.news2>=5?["NEWS2 alto"]:[])
          ];
          const name = (r?.name?.[0]?.family||"") + (r?.name?.[0]?.given?.[0]?`, ${r.name[0].given[0]}`:"");
          return { id:r.id, name:name||r.id, unit:"—", priority, alerts };
        });
        setRows(rows.sort((a,b)=>b.priority-a.priority));
      }
    })();
  },[]);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-xl font-bold mb-3">Entrega de turno (día/noche)</h1>
      <div className="grid gap-2">
        {rows.map(r=>(
          <div key={r.id} className="border rounded p-3 flex items-center justify-between">
            <div>
              <div className="font-semibold">{r.name}</div>
              <div className="text-sm opacity-70">Unidad: {r.unit||"—"}</div>
              <div className="text-sm">{r.alerts.map(a=><span key={a} className="inline-block border rounded px-2 py-0.5 mr-2">{a}</span>)}</div>
            </div>
            <div className="text-lg font-bold">Prioridad {r.priority}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
