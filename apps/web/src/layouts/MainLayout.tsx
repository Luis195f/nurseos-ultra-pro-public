import React from "react";
import { NavLink, Outlet } from "react-router-dom";

const linkBase: React.CSSProperties = { display:"block", padding:"8px 10px", borderRadius:8, textDecoration:"none", marginBottom:6, color:"#0a0a0a" };
const active   = { background:"#e0f7ff", fontWeight:700 };

export default function MainLayout(){
  return (
    <div style={{display:"grid", gridTemplateColumns:"260px 1fr", minHeight:"100vh"}}>
      <aside style={{background:"#f5f7fb", padding:16, borderRight:"1px solid #e5e7eb"}}>
        <div style={{fontSize:22, fontWeight:800, marginBottom:12}}>NurseOS Ultra Pro</div>

        {/* Prioridad: Registro primero */}
        <NavLink to="/registry" style={({isActive})=>({...linkBase, ...(isActive?active:{})})}>
          Registro de Pacientes
        </NavLink>

        <NavLink to="/scales" style={({isActive})=>({...linkBase, ...(isActive?active:{})})}>Escalas</NavLink>
        <NavLink to="/education" style={({isActive})=>({...linkBase, ...(isActive?active:{})})}>Educación</NavLink>
        <NavLink to="/management" style={({isActive})=>({...linkBase, ...(isActive?active:{})})}>Gestión</NavLink>
        <NavLink to="/research" style={({isActive})=>({...linkBase, ...(isActive?active:{})})}>Investigación</NavLink>
        <NavLink to="/handover" style={({isActive})=>({...linkBase, ...(isActive?active:{})})}>Entrega de Turno</NavLink>
        <NavLink to="/adt" style={({isActive})=>({...linkBase, ...(isActive?active:{})})}>Admisiones/Traslados/Altas/Morgue</NavLink>

        <div style={{height:8}} />

        <NavLink to="/bcma" style={({isActive})=>({...linkBase, ...(isActive?active:{})})}>BCMA (Demo)</NavLink>
        <NavLink to="/bcma-pro" style={({isActive})=>({...linkBase, ...(isActive?active:{})})}>BCMA Pro</NavLink>
        <NavLink to="/bcma-hg" style={({isActive})=>({...linkBase, ...(isActive?active:{})})}>BCMA Hospital</NavLink>

        <div style={{height:8}} />

        <NavLink to="/code-blue" style={({isActive})=>({...linkBase, ...(isActive?active:{}) , color:"#8a0010", background:isActive?"#ffe5e8":"#ffeef0", fontWeight:800})}>
          CÓDIGO AZUL
        </NavLink>

        <div style={{height:8}} />

        <NavLink to="/ai" style={({isActive})=>({...linkBase, ...(isActive?active:{})})}>Panel IA</NavLink>
        <NavLink to="/deceased" style={({isActive})=>({...linkBase, ...(isActive?active:{})})}>Fallecidos</NavLink>
        <NavLink to="/audit" style={({isActive})=>({...linkBase, ...(isActive?active:{})})}>Auditoría</NavLink>
      </aside>

      <main style={{padding:16}}>
        <Outlet />
      </main>
    </div>
  );
}

