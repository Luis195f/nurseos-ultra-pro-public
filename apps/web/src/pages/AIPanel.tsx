// src/pages/AIPanel.tsx
import { useState } from "react";
import { runScaleAgent, structureNote, validateBundle, abacEval } from "../services/agentsClient";

type Msg = { role: "user" | "assistant"; text: string };

export default function AIPanel() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", text: "Hola 👋 Soy tu asistente de enfermería. Puedo ejecutar escalas (Braden), estructurar notas FHIR, validar y comprobar permisos ABAC." },
  ]);
  const [input, setInput] = useState("Paciente 72 años, úlcera sacra, dolor 6/10. Valorar riesgo UPP y proponer plan.");
  const [busy, setBusy] = useState(false);

  async function onSend() {
    const text = input.trim();
    if (!text) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    try {
      setBusy(true);
      const scale = await runScaleAgent({ name: "braden", answers: { movilidad: "limitada", humedad: "constante", friccion: "problemas" } });
      const doc = await structureNote({ note: text });
      let validation = { status: "skipped" as const };
      try { validation = await validateBundle({ resources: doc.resources }); } catch {}
      const abac = await abacEval({ action: "create", resourceType: "CarePlan", context: { role: "nurse" } });
      const summary = [
        `• Escala Braden → ${JSON.stringify(scale.result)}`,
        `• Estructurado FHIR → ${doc.resources.length} recursos`,
        `• Validación → ${validation.status}`,
        `• ABAC → ${abac.allow ? "permitido" : "denegado"} (${abac.reason || "ok"})`,
      ].join("\n");
      setMessages((m) => [...m, { role: "assistant", text: summary }]);
    } catch (err: any) {
      setMessages((m) => [...m, { role: "assistant", text: "Ocurrió un error: " + (err.message || String(err)) }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <h1>Panel de IA</h1>
      <div className="card" style={{ minHeight: 220, display: "grid", gap: 8 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ whiteSpace: "pre-wrap" }}>
            <strong>{m.role === "user" ? "Tú" : "Asistente"}:</strong> {m.text}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Escribe una instrucción clínica…" style={{ flex: 1, padding: 8 }} />
        <button className="button" onClick={onSend} disabled={busy}>{busy ? "Trabajando…" : "Enviar"}</button>
      </div>
      <p className="muted">Prototipo con revisión humana obligatoria. No sustituye el juicio clínico.</p>
    </div>
  );
}
