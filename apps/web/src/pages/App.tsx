import { Link } from 'react-router-dom'
export default function App(){
  return (
    <div>
      <nav>
        <Link to="/">Inicio</Link>
        <Link to="/patients">Pacientes</Link>
        <Link to="/education">Educación</Link>
        <Link to="/management">Gestión</Link>
        <Link to="/research">Investigación</Link>
      </nav>
      <div style={{padding:16}} className="grid">
        <div className="card">
          <h2>Registro rápido de paciente</h2>
          <form onSubmit={(e)=>{e.preventDefault(); alert('Paciente creado en 1 click (demo).')}}>
            <label>Nombre</label><input placeholder="Nombre y apellidos" defaultValue="María López"/>
            <label>Edad</label><input type="number" defaultValue={72}/>
            <button className="button" style={{marginTop:8}}>Crear</button>
          </form>
        </div>
        <div className="card"><h2>Escalas clínicas</h2><p>Motor dinámico (NEWS2, GCS, Barthel, Norton, Morse, Karnofsky, Braden, Katz, qSOFA, NRS).</p><a className="button" href="/patients">Abrir</a></div>
        <div className="card"><h2>E-Consentimiento</h2><p>Firma biométrica + PDF + QR + verificación.</p><a className="button" href="/econsent">Abrir</a></div>
      </div>
    </div>
  )
}
