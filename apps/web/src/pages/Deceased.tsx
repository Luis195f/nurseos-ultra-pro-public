import React, { useState } from "react";
import { STORE_KEYS } from "@/lib/store";

type DeceasedRecord = {
  patientId: string;
  dateTime: string;
  cause: string;
};

const STORAGE_PREFIX = "nurseos:";

export default function Deceased() {
  const [patientId, setPatientId] = useState("");
  const [dateTimeLocal, setDateTimeLocal] = useState(
    () => new Date().toISOString().slice(0, 16) // yyyy-mm-ddThh:mm
  );
  const [cause, setCause] = useState("");
  const [status, setStatus] = useState("");

  function persist(r: DeceasedRecord) {
    const key = STORAGE_PREFIX + STORE_KEYS.DECEASED;
    const prev = JSON.parse(localStorage.getItem(key) || "[]") as DeceasedRecord[];
    localStorage.setItem(key, JSON.stringify([...prev, r]));
  }

  function handleSave() {
    if (!patientId) return;
    persist({
      patientId,
      dateTime: new Date(dateTimeLocal).toISOString(),
      cause,
    });
    setStatus("Paciente marcado como fallecido"); // <- texto exacto esperado
    setPatientId("");
    setCause("");
  }

  return (
    <section style={{ display: "grid", gap: 12, maxWidth: 640 }}>
      <h1>Fallecidos</h1>

      <div>
        <label htmlFor="dec-pid">Patient ID</label>
        <input
          id="dec-pid"
          style={{ marginLeft: 8 }}
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="dec-dt">Fecha y hora</label>
        <input
          id="dec-dt"
          type="datetime-local"
          style={{ marginLeft: 8 }}
          value={dateTimeLocal}
          onChange={(e) => setDateTimeLocal(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="dec-cause">Causa</label>
        <input
          id="dec-cause"
          placeholder="p.ej., paro cardiorrespiratorio"
          style={{ marginLeft: 8, width: "100%" }}
          value={cause}
          onChange={(e) => setCause(e.target.value)}
        />
      </div>

      <button
        onClick={handleSave}
        style={{
          padding: "10px 14px",
          borderRadius: 8,
          background: "rgb(17, 24, 39)",
          color: "#fff",
          border: "none",
        }}
      >
        Registrar fallecimiento
      </button>

      {status && (
        <p role="status" aria-live="polite">
          {status}
        </p>
      )}
    </section>
  );
}

