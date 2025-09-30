import React, { useEffect, useMemo, useState } from "react";
import { listOutbox } from "../registry/outbox";
import { authFetch } from "../security/authFetch";

type RemotePatient = { id: string; name: string; lastUpdated?: string };
type LocalPatient = { id: string; name: string };

export default function PatientsDashboard() {
  const [localPatients, setLocalPatients] = useState<LocalPatient[]>([]);
  const [remotePatients, setRemotePatients] = useState<RemotePatient[]>([]);
  const [q, setQ] = useState("");

  const base = import.meta.env.VITE_FHIR_BASE_URL as string;

  useEffect(() => {
    (async () => {
      // Locales (Outbox)
      const items = await listOutbox();
      const locals: LocalPatient[] = items
        .map((it: any) => {
          const pEntry = it.payload?.entry?.find((e: any) => e.resource?.resourceType === "Patient");
          const p = pEntry?.resource;
          if (!p) return null;
          const name =
            (p?.name?.[0]?.family || "") +
            (p?.name?.[0]?.given?.[0] ? `, ${p?.name?.[0]?.given?.[0]}` : "");
      return { id: p.id || "(local)", name: name.trim() || "(sin nombre)" };
        })
        .filter(Boolean) as LocalPatient[];
      setLocalPatients(locals);

      // Remotos (FHIR)
      try {
        const url = `${base}/Patient?_sort=-_lastUpdated&_count=50`;
        const res = await authFetch(url, { method: "GET" });
        if (res.ok) {
          const b = await res.json();
          const rem: RemotePatient[] = (b.entry || []).map((e: any) => {
            const r = e.resource;
            const name =
              (r?.name?.[0]?.family || "") +
              (r?.name?.[0]?.given?.[0] ? `, ${r?.name?.[0]?.given?.[0]}` : "");
            return { id: r.id, name: name.trim() || r.id, lastUpdated: r.meta?.lastUpdated };
          });
          setRemotePatients(rem);
        }
      } catch {
        // Ignora error de red/permiso en listado; la parte local sigue funcionando
      }
    })();
  }, [base]);

  const qNorm = q.trim().toLowerCase();
  const localFiltered = useMemo(
    () => localPatients.filter(p => p.name.toLowerCase().includes(qNorm)),
    [localPatients, qNorm]
  );
  const remoteFiltered = useMemo(
    () => remotePatients.filter(p => p.name.toLowerCase().includes(qNorm) || p.id.toLowerCase().includes(qNorm)),
    [remotePatients, qNorm]
  );

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Pacientes</h1>
        <input
          className="border rounded p-2"
          placeholder="Buscar por nombre o ID…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <section className="mb-6">
        <h2 className="font-semibold mb-2">Locales (pendientes de sincronizar)</h2>
        {localFiltered.length === 0 ? (
          <div className="text-sm opacity-70">No hay pacientes locales.</div>
        ) : (
          <ul className="list-disc pl-5">
            {localFiltered.map((p, i) => (
              <li key={`l-${i}`}>{p.name} <span className="opacity-60">[local]</span></li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-semibold mb-2">Servidor FHIR</h2>
        {remoteFiltered.length === 0 ? (
          <div className="text-sm opacity-70">No se encontraron pacientes remotos.</div>
        ) : (
          <ul className="list-disc pl-5">
            {remoteFiltered.map((p, i) => (
              <li key={`r-${i}`}>
                {p.name} <span className="opacity-60">[{p.id}]</span>
                {p.lastUpdated ? <span className="opacity-50"> — {new Date(p.lastUpdated).toLocaleString()}</span> : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
