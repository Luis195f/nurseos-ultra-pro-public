import { useEffect, useState } from "react";
import { key, load, save } from "../lib/store";
import { ensurePatient, hasFHIR, registerDeviceUse } from "../lib/fhir";

const OPTIONS = [
  "Oxígeno", "Monitor", "Bomba infusión", "SNG", "Sonda vesical",
  "Catéter central", "CPAP/BiPAP", "Marcapasos transitorio"
];

export default function DeviceChips({ patientId }: { patientId: string }) {
  const k = key("devices", patientId);
  const [val, setVal] = useState<string[]>(() => load<string[]>(k, []));

  useEffect(() => { save(k, val); }, [k, val]);
  useEffect(() => { if (hasFHIR) ensurePatient(patientId); }, [patientId]);

  async function toggle(lbl: string) {
    const next = val.includes(lbl) ? val.filter(x => x !== lbl) : [...val, lbl];
    setVal(next);
    if (hasFHIR && next.includes(lbl)) {
      try { await registerDeviceUse(patientId, lbl); } catch { /* ignora por ahora */ }
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {OPTIONS.map(lbl => (
        <button key={lbl}
          onClick={() => toggle(lbl)}
          className={`px-3 py-1 rounded-full border ${val.includes(lbl) ? "bg-red-600 text-white border-red-700" : "bg-white hover:bg-neutral-100"}`}>
          {lbl}
        </button>
      ))}
    </div>
  );
}
