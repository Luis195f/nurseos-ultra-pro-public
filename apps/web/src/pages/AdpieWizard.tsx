import React, { useMemo, useState } from "react";
import { runAdpieEngine, type AdpieSuggestion } from "../adpie/engine";
import { buildCarePlanBundle } from "../registry/mappers-careplan";
import { enqueueBundle } from "../registry/outbox";
import { sendBundleToFhir } from "../fhir/sendBundle";

export default function AdpieWizard(){
  // En real: traer ctx de paciente seleccionado, escalas (NEWS2, Morse, Braden) y vitales
  const ctx = { scales:{ news2AnyParam:3, morse:50, braden:15 }, vitals:{ glucose: 220 } };
  const suggestions = useMemo(()=>runAdpieEngine(ctx), []);
  const [chosen, setChosen] = useState<Record<string,boolean>>({});

  const selected:AdpieSuggestion[] = suggestions.filter(s=> chosen[s.id]);

  async function saveLocally(){
    const b = buildCarePlanBundle(selected);
    await enqueueBundle(b);
    alert("Plan de cuidados en Outbox ✅");
  }
  async function syncNow(){
    const b = buildCarePlanBundle(selected);
    await sendBundleToFhir(b, { justification: "adpie-wizard" });
    alert("Plan sincronizado con FHIR ✅");
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-3">ADPIE asistido (sugerencias no oficiales)</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {suggestions.map(s=>
          <label key={s.id} className="border rounded p-3 flex gap-3">
            <input type="checkbox" checked={!!chosen[s.id]} onChange={e=>setChosen({...chosen, [s.id]:e.target.checked})}/>
            <div>
              <div className="font-semibold">{s.diagnosis}</div>
              <div className="text-sm opacity-80">Evidencia: {s.evidence}</div>
              <div className="mt-2 text-sm"><span className="font-medium">Resultados:</span> {s.outcomes.join("; ")}</div>
              <div className="mt-1 text-sm"><span className="font-medium">Intervenciones:</span> {s.interventions.join("; ")}</div>
            </div>
          </label>
        )}
      </div>
      <div className="mt-4 flex gap-2">
        <button className="border rounded px-3 py-2" onClick={saveLocally}>Guardar en Outbox</button>
        <button className="border rounded px-3 py-2" onClick={syncNow}>Sincronizar ahora</button>
      </div>
    </div>
  );
}
