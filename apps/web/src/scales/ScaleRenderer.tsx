import React, { useMemo, useState } from 'react';
type Option = { label: string; points: number };
type Range = { min: number; max: number; label: string };
type ItemCommon = { id: string; label: string; type: 'checkbox'|'select'|'number' };
type ItemCheckbox = ItemCommon & { type: 'checkbox'; points: number };
type ItemSelect = ItemCommon & { type: 'select'; options: Option[] };
type ItemNumber = ItemCommon & { type: 'number'; ranges: { min?: number; max?: number; points: number }[] };
type Item = ItemCheckbox | ItemSelect | ItemNumber;
type ScaleDef = { id: string; title: string; items: Item[]; ranges?: Range[]; notes?: string };

function scoreItem(it: Item, val: any): number {
  if (it.type === 'checkbox') return val ? (it as any).points : 0;
  if (it.type === 'select') return (it as any).options[val ?? -1]?.points ?? 0;
  if (it.type === 'number') {
    const n = Number(val ?? NaN);
    if (Number.isNaN(n)) return 0;
    for (const r of (it as any).ranges) {
      const lo = r.min ?? -Infinity, hi = r.max ?? Infinity;
      if (n >= lo && n <= hi) return r.points;
    }
    return 0;
  }
  return 0;
}

export default function ScaleRenderer({ def }: { def: ScaleDef }){
  const [values, setValues] = useState<Record<string, any>>({});
  const totals = useMemo(() => {
    const pts = def.items.map(it => scoreItem(it as any, values[it.id]));
    const total = pts.reduce((a,b)=>a+b,0);
    const redFlag = def.id.toLowerCase().startsWith('news2') && def.items.some(it => scoreItem(it as any, values[it.id]) === 3);
    return { total, redFlag };
  }, [values, def]);
  const risk = useMemo(() => def.ranges?.find(r => totals.total>=r.min && totals.total<=r.max)?.label ?? '—', [totals.total, def.ranges]);

  return (
    <div className="card">
      <h3>{def.title}</h3>
      {def.notes && <p style={{opacity:.8, fontSize:12}}>{def.notes}</p>}
      {def.items.map((it) => (
        <div key={it.id} style={{margin:"8px 0"}}>
          <label style={{display:'block', marginBottom:4}}>{it.label}</label>
          {it.type === 'checkbox' && (
            <input type="checkbox" checked={!!values[it.id]} onChange={e=> setValues(v=>({...v, [it.id]: e.target.checked}))} />
          )}
          {it.type === 'select' && (
            <select value={values[it.id] ?? ""} onChange={e=> setValues(v=>({...v, [it.id]: e.target.value}))}>
              <option value="" disabled>Seleccionar…</option>
              {(it as any).options.map((op: Option, idx: number) => <option key={idx} value={idx}>{op.label} (+{op.points})</option>)}
            </select>
          )}
          {it.type === 'number' && (
            <input type="number" inputMode="decimal" placeholder="Valor" onChange={e=> setValues(v=>({...v, [it.id]: e.target.value}))}/>
          )}
        </div>
      ))}
      <div style={{marginTop:12}}><strong>Total:</strong> {totals.total} &nbsp; <strong>Riesgo:</strong> {risk}</div>
      {totals.redFlag && <div style={{marginTop:8, fontSize:12, color:'#fca5a5'}}>NEWS2: ¡Alerta! Algún parámetro con 3 puntos.</div>}
    </div>
  );
}
