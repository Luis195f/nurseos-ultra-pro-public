import React from "react";

export type DeviceItem = { code:string; text:string };

export const DEVICE_CATALOG: DeviceItem[] = [
  { code:"PIV",  text:"PIV (Vía periférica)" },
  { code:"CVC",  text:"CVC (Vía central)" },
  { code:"NGT",  text:"Sonda nasogástrica" },
  { code:"VENT", text:"Ventilación invasiva" },
  { code:"O2",   text:"Cánula de O₂" },
  { code:"FOLEY",text:"Sonda vesical Foley" },
  { code:"PICC", text:"PICC" },
  { code:"TRACH",text:"Traqueostomía" },
];

export default function DeviceChips({
  selected,
  onToggle,
}:{
  selected: string[];
  onToggle: (code:string)=>void;
}){
  return (
    <div style={{display:"flex", flexWrap:"wrap", gap:8}}>
      {DEVICE_CATALOG.map(d => (
        <button key={d.code}
          onClick={()=>onToggle(d.code)}
          style={{
            padding:"6px 10px",
            borderRadius:20,
            border:"1px solid #ddd",
            background: selected.includes(d.code) ? "#d1fae5" : "#fff",
            cursor:"pointer"
          }}>
          {d.text}
        </button>
      ))}
    </div>
  );
}
