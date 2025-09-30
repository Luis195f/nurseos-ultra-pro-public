// frontend/src/scales/scalesLoader.ts
type JsonModule = { default: unknown };

const registry = import.meta.glob('../../packages/scales/definitions/*.json', { eager: true });

export function getScale(name: string) {
  const key = `../../packages/scales/definitions/${name}.json`;
  const mod = registry[key] as JsonModule | undefined;
  if (!mod) throw new Error(`Scale not found: ${name}`);
  return (mod as JsonModule).default;
}

// uso: const katz = getScale('katz'); // <- carga katz.json sin errores de Vite
