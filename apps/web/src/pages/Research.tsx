import MultiAgentAssist from "../components/MultiAgentAssist";

export default function Research(){
  return (
    <div style={{ display:"grid", gap:16 }}>
      <h1>Investigación</h1>
      <div className="card">
        <p>Protocolos, datos anonimizados y notas estructuradas.</p>
      </div>
      <MultiAgentAssist
        title="IA para Investigación"
        placeholder="Pide resúmenes, extracción de variables, plantillas FHIR…"
        defaultNote="Genera variables observacionales a partir de esta nota para un estudio de úlcera por presión."
        context={{ role:"nurse-research" }}
      />
    </div>
  );
}
