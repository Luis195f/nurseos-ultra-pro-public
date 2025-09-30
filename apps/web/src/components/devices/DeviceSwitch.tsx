import { useState } from "react";
import { toggleDeviceUse } from "@/lib/fhir";

export default function DeviceSwitch({ patientId, gtin, label }: { patientId: string; gtin: string; label: string; }) {
  const [on, setOn] = useState(false);
  async function toggle() {
    const next = !on; setOn(next);
    await toggleDeviceUse(patientId, gtin, next);
  }
  return (
    <button onClick={toggle} className={`px-3 py-2 rounded-xl border ${on?"bg-green-600 text-white":"bg-white"}`}>
      {label} — {on? "ON" : "OFF"}
    </button>
  );
}
