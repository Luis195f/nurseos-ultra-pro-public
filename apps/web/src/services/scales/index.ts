// Load scale definitions via import.meta.glob (build-time index)
const modules = import.meta.glob('../../scales/definitions/*.json', { eager: true, import: 'default' }) as Record<string, any>;
const byName: Record<string, any> = {};
for (const path in modules) {
  const name = path.split('/').pop()!.replace('.json','').toLowerCase();
  byName[name] = modules[path];
}
export function listScales(){ return Object.keys(byName).sort(); }
export async function loadScale(name: string){
  const key = name.toLowerCase(); const def = byName[key];
  if(!def) throw new Error(`Scale not found: ${name}`);
  return def;
}
