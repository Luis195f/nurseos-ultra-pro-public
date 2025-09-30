import MultiAgentAssist from "../components/MultiAgentAssist";

export default function Education(){
  return (
    <div style={{ display:"grid", gap:16 }}>
      <h1>Educación</h1>
      <div className="card">
        <p>Materiales y módulos para pacientes y cuidadores.</p>
      </div>
      <MultiAgentAssist
        title="IA Educativa"
        placeholder="Generar plan educativo personalizado…"
        defaultNote="Paciente con dolor crónico y úlcera por presión. Elaborar plan educativo y señales de alarma."
        context={{ role:"nurse" }}
      />
    </div>
  );
}
