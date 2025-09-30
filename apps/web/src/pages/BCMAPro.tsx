import React, { useState } from "react";
export default function BCMAPro(){
  const [code,setCode]=useState("");
  return (<section style={{display:"grid",gap:12}}>
    <h1>BCMA Pro</h1>
    <p>Demostración simple: ingresa un código para simular escaneo.</p>
    <input value={code} onChange={e=>setCode(e.target.value)} placeholder="GTIN/NDC" />
    <div>Código leído: <b>{code||"(ninguno)"}</b></div>
  </section>);
}
