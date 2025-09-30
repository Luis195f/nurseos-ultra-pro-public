// src/components/MultiAgentAssist.tsx
import { useState } from "react";
import { aiSummarizeWithGuards } from "../services/agentsClient";

type Props = {
  title?: string;
  placeholder?: string;
  defaultNote?: string;
  context?: any;
};

export default function MultiAgentAssist({ title = "Asistente IA", placeholder = "Describe el caso…", defaultNote = "", context }: Props) {
  const [note, setNote] = useState(defaultNote);
  const [busy, setBusy] = useState(false);
  const [out, setOut] = useState<string>("");

  async function run() {
    const text = note.trim();
    if (!text) return;
    setBusy(true);
    try {
      const { doc, status, abac } = await aiSummarizeWithGuards(text, context);
      const summary =
        `• Estructurado FHIR → ${doc.resources.length} recursos\n` +
        `• Validación → ${status}\n` +
        `• ABAC → ${abac.allow ? "permitido" : "denegado"}${abac.reason ? " (" + abac.reason + ")" : ""}`;
      setOut(summary);
    } catch (e: any) {
      setOut("Error: " + (e?.message ?? String(e)));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card" style={{ display: "grid", gap: 8 }}>
      <h3 style={{ margin: 0 }}>{title}</h3>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder={placeholder}
        rows={4}
        style={{ width: "100%", padding: 8 }}
      />
      <div style={{ display: "flex", gap: 8 }}>
        <button className="button" onClick={run} disabled={busy}>{busy ? "Trabajando…" : "Generar con IA"}</button>
        <div className="muted" style={{ alignSelf: "center" }}>Revisión humana obligatoria.</div>
      </div>
      {out && <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{out}</pre>}
    </div>
  );
}
