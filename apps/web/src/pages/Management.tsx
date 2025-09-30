import MultiAgentAssist from "../components/MultiAgentAssist";

export default function Management(){
  return (
    <div style={{ display:"grid", gap:16 }}>
      <h1>Gestión</h1>
      <div className="card">
        <p>Planificación, recursos y KPIs.</p>
      </div>
      <MultiAgentAssist
        title="IA Operativa"
        placeholder="Solicitar apoyo IA para turnos, cargas, indicadores…"
        defaultNote="Genera checklist para entrega de turno en UCI con foco en riesgo de UPP y caídas."
        context={{ role:"nurse" }}
      />
    </div>
  );
}
