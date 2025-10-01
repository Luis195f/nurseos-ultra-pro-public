import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import DeviceChips from "../components/DeviceChips";

export default function PatientRecord() {
  const urlId = useParams().id ?? "";
  const [pid, setPid] = useState(urlId || "P001");
  const nav = useNavigate();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Registro del Paciente</h1>

      <div className="flex gap-2 items-end">
        <div>
          <label className="block text-sm">Patient ID</label>
          <input value={pid} onChange={e=>setPid(e.target.value)} className="border px-2 py-1 rounded w-48" />
        </div>
        <button className="px-3 py-2 bg-neutral-800 text-white rounded" onClick={()=>nav(`/patients/${pid}`)}>Ir</button>
      </div>

      <section className="space-y-2">
        <h2 className="font-semibold">Dispositivos (un click)</h2>
        <DeviceChips patientId={pid} />
      </section>
    </div>
  );
}
