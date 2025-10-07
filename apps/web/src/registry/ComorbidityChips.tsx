import React, { useMemo } from "react";

type Item = { id:string; label:string };
type Category = { name:string; items: Item[] };
type Catalog = { categories: Category[]; presets?: {id:string; label:string; include:string[]}[] };

export function ComorbidityChips({
  selected, onChange, catalog, query
}:{ selected:string[]; onChange:(ids:string[])=>void; catalog:Catalog; query?:string }) {
  const toggle = (id:string) => {
    const set = new Set(selected);
    set.has(id) ? set.delete(id) : set.add(id);
    onChange(Array.from(set));
  };
  const filtered = useMemo(()=>{
    const q = (query||"").trim().toLowerCase();
    if (!q) return catalog.categories;
    return catalog.categories.map(c=> ({
      ...c,
      items: c.items.filter(it=> it.label.toLowerCase().includes(q) || it.id.toLowerCase().includes(q))
    })).filter(c=>c.items.length>0);
  }, [catalog, query]);

  return (
    <div className="flex flex-col gap-4">
      {catalog.presets?.length ? (
        <div className="flex flex-wrap gap-2">
          {catalog.presets.map(p=>(
            <button key={p.id} type="button" onClick={()=>{
              const set = new Set(selected);
              p.include.forEach(id=>set.add(id));
              onChange(Array.from(set));
            }} className="px-3 py-1 rounded-2xl border text-sm">Preset: {p.label}</button>
          ))}
          <button type="button" onClick={()=>onChange([])} className="px-3 py-1 rounded-2xl border text-sm">Sin comorbilidades conocidas</button>
        </div>
      ):null}
      {filtered.map(cat=>(
        <div key={cat.name}>
          <div className="font-semibold mb-2">{cat.name}</div>
          <div className="flex flex-wrap gap-2">
            {cat.items.map(it=>{
              const active = selected.includes(it.id);
              return (
                <button key={it.id} type="button" onClick={()=>toggle(it.id)}
                  className={`px-3 py-1 rounded-2xl border text-sm ${active ? "bg-black text-white" : ""}`}>
                  {it.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
