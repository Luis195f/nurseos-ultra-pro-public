export const FLAGS = {
  voiceNotes: true,
  handoverPro: true,
  bcmaDemo: true,
  eConsent: true,
  pwa: true,
  ragLocal: false,
  agents: true,
  multiprof_fisio: false,
  multiprof_matrona: false,
  multiprof_farmacia: false,
  multiprof_nutricion: false,
} as const;

export type FlagName = keyof typeof FLAGS;

export function isFlagEnabled(name: FlagName): boolean {
  try {
    const raw = localStorage.getItem('flags.override');
    if (!raw) return !!FLAGS[name];
    const o = JSON.parse(raw) as Partial<Record<FlagName, boolean>>;
    return typeof o[name] === 'boolean' ? (o[name] as boolean) : !!FLAGS[name];
  } catch {
    return !!FLAGS[name];
  }
}
