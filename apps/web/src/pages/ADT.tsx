// src/pages/ADT.tsx
import { useEffect, useMemo, useState } from "react";
import { listPatients, listDevices, savePatientDocument } from "../services/fhirClient";
import MultiAgentAssist from "../components/MultiAgentAssist";

const unitList = ["Urgencias","UCI","Medicina Interna","Quirófano","Traumatología","Oncología","Pediatría","Neonatos","Cardiología","Neurología"];

export default function ADT(){
  const [patients, setPatients] = useState<any[]>([]);
  const [patientId, setPatientId] = useState<string>("");
  const [devices, setDevices] = useState<string[]>([]);
  const [fromUnit, setFromUnit] = useState("UCI");
  const [toUnit, setToUnit] = useState("Medicina Interna");
  const [reason, setReason] = useState("");
  const [history, setHistory] = useState("");
  const [medChanges, setMedChanges] = useState("");
  const [dischargeNote, setDischargeNote] = useState("");
  const [dischargeTo, setDischargeTo] = useState("Domicilio");

  useEffect(()=>{ (async()=>{ const {patients} = await listPatients(); setPatients(patients); })(); }, []);
  useEffect(()=>{ (async()=>{ if (patientId) setDevices(await listDevices(patientId)); })(); }, [patientId]);

  const selected = useMemo(()=>patients.find(p=>p.id===patientId), [patients, patientId]);
  const fullName = (p:any) => ((p?.name?.[0]?.given?.join(" ") || "") + " " + (p?.name?.[0]?.family || "")).trim();

  async function saveTransfer() {
    if (!patientId) { alert("Selecciona paciente"); return; }
    const p = selected!;
    const text =
`TRASLADO
Paciente: ${fullName(p)} (ID: ${p.id})
Desde: ${fromUnit}  →  Hacia: ${toUnit}
Motivo del traslado: ${reason || "-"}

Resumen clínico desde el ingreso:
${history || "-"}

Cambios de medicación durante hospitalización:
${medChanges || "-"}

Dispositivos actuales: ${devices.length ? devices.join(", ") : "ninguno"}
(Generado en NurseOS)`;
    await savePatientDocument(patientId, "transfer", `Traslado ${fromUnit}→${toUnit}`, text);
    alert("Traslado registrado en historial.");
    setReason(""); setHistory(""); setMedChanges("");
  }

  async function saveDischarge() {
    if (!patientId) { alert("Selecciona paciente"); return; }
    const p = selected!;
    const text =
`ALTA
Paciente: ${fullName(p)} (ID: ${p.id})
Destino del alta: ${dischargeTo}

Resumen de hospitalización:
${history || "-"}

Cambios de medicación:
${medChanges || "-"}

Recomendaciones/Plan al alta:
${dischargeNote || "-"}

Dispositivos al alta: ${devices.length ? devices.join(", ") : "ninguno"}
(Generado en NurseOS)`;
    await savePatientDocument(patientId, "discharge", `Alta a ${dischargeTo}`, text);
    alert("Alta registrada en historial.");
    setDischargeNote("");
  }

  return (
    <div style={{ display:"grid", gap:16 }}>
      <h1>Admisiones / Traslados / Altas / Morgue</h1>

      <div className="card" style={{ display:"grid", gap:12 }}>
        <div style={{ display:"grid", gridTemplateColumns:"minmax(240px,1fr) minmax(240px,1fr)", gap:8 }}>
          <div>
            <div className="muted">Paciente</div>
            <select value={patientId} onChange={(e)=>setPatientId(e.target.value)} style={{ width:"100%", padding:8 }}>
              <option value="">— Selecciona —</option>
              {patients.map(p => <option key={p.id} value={p.id}>{fullName(p)} ({p.id})</option>)}
            </select>
          </div>
          {patientId && <div className="muted" style={{ alignSelf:"end" }}>Dispositivos: {devices.join(", ") || "ninguno"}</div>}
        </div>

        <div className="card" style={{ display:"grid", gap:8 }}>
          <h3 style={{ margin:0 }}>Traslado</h3>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(2, minmax(240px,1fr))", gap:8 }}>
            <label>Desde
              <select value={fromUnit} onChange={(e)=>setFromUnit(e.target.value)} style={{ width:"100%", padding:8 }}>
                {unitList.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </label>
            <label>Hacia
              <select value={toUnit} onChange={(e)=>setToUnit(e.target.value)} style={{ width:"100%", padding:8 }}>
                {unitList.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </label>
          </div>
          <label>Motivo del traslado<textarea rows={2} value={reason} onChange={(e)=>setReason(e.target.value)} /></label>
          <label>Resumen de la historia (desde ingreso)<textarea rows={3} value={history} onChange={(e)=>setHistory(e.target.value)} /></label>
          <label>Cambios de medicación<textarea rows={2} value={medChanges} onChange={(e)=>setMedChanges(e.target.value)} /></label>
          <button className="button" onClick={saveTransfer}>Guardar traslado</button>
        </div>

        <div className="card" style={{ display:"grid", gap:8 }}>
          <h3 style={{ margin:0 }}>Alta</h3>
          <label>Destino
            <select value={dischargeTo} onChange={(e)=>setDischargeTo(e.target.value)} style={{ width:"100%", padding:8 }}>
              {["Domicilio","Otra unidad","Centro de rehabilitación","Otra institución","Fallecimiento"].map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
          <label>Resumen de hospitalización<textarea rows={3} value={history} onChange={(e)=>setHistory(e.target.value)} /></label>
          <label>Cambios de medicación<textarea rows={2} value={medChanges} onChange={(e)=>setMedChanges(e.target.value)} /></label>
          <label>Recomendaciones al alta<textarea rows={3} value={dischargeNote} onChange={(e)=>setDischargeNote(e.target.value)} /></label>
          <button className="button" onClick={saveDischarge}>Guardar alta</button>
        </div>
      </div>

      {patientId && (
        <MultiAgentAssist
          title="IA — Resumen ADT"
          placeholder="Pide a la IA que estructure traslado/alta en FHIR o proponga plan de continuidad…"
          defaultNote={`Paciente ${fullName(selected)}. Traslado ${fromUnit}→${toUnit} / Alta: ${dischargeTo}. Dispositivos: ${devices.join(", ") || "ninguno"}.`}
          context={{ role:"nurse", adt:true }}
        />
      )}
    </div>
  );
}
