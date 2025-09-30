import React,{useEffect,useState} from "react";
const API = import.meta.env.VITE_AGENTS_API_BASE || "http://localhost:8070";
type Ev={ts:string;user:string;action:string;resourceType:string;patientId?:string;allow?:boolean;reason?:string;details?:any};
export default function Audit(){
  const [events,setEvents]=useState<Ev[]>([]);
  useEffect(()=>{const load=()=>fetch(`${API}/audit/events`).then(r=>r.json()).then(setEvents).catch(()=>{});load();const t=setInterval(load,5000);return()=>clearInterval(t);},[]);
  const allowCnt=events.filter(e=>e.allow===true).length, denyCnt=events.filter(e=>e.allow===false).length;
  return (<section style={{display:"grid",gap:12}}><h1>Auditoría</h1>
    <div style={{display:"flex",gap:16}}>
      <div style={{padding:10,border:"1px solid var(--line)",borderRadius:8}}>Permisos: <b>{allowCnt}</b></div>
      <div style={{padding:10,border:"1px solid var(--line)",borderRadius:8}}>Denegados: <b>{denyCnt}</b></div>
      <div style={{padding:10,border:"1px solid var(--line)",borderRadius:8}}>Total: <b>{events.length}</b></div>
    </div>
    <table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>
      <th style={{textAlign:"left",borderBottom:"1px solid var(--line)",padding:6}}>Fecha</th>
      <th style={{textAlign:"left",borderBottom:"1px solid var(--line)",padding:6}}>Usuario</th>
      <th style={{textAlign:"left",borderBottom:"1px solid var(--line)",padding:6}}>Acción</th>
      <th style={{textAlign:"left",borderBottom:"1px solid var(--line)",padding:6}}>Recurso</th>
      <th style={{textAlign:"left",borderBottom:"1px solid var(--line)",padding:6}}>Paciente</th>
      <th style={{textAlign:"left",borderBottom:"1px solid var(--line)",padding:6}}>Permiso</th>
      <th style={{textAlign:"left",borderBottom:"1px solid var(--line)",padding:6}}>Motivo</th>
    </tr></thead><tbody>
      {events.map((e,i)=>(<tr key={i} style={{borderBottom:"1px solid var(--line)"}}>
        <td style={{padding:6}}>{new Date(e.ts).toLocaleString()}</td>
        <td style={{padding:6}}>{e.user}</td>
        <td style={{padding:6}}>{e.action}</td>
        <td style={{padding:6}}>{e.resourceType}</td>
        <td style={{padding:6}}>{e.patientId||""}</td>
        <td style={{padding:6,color:e.allow===false?'var(--danger)':'var(--accent)'}}>{e.allow===undefined?'-':(e.allow?'ALLOW':'DENY')}</td>
        <td style={{padding:6}}>{e.reason||""}</td>
      </tr>))}
    </tbody></table>
  </section>);}
