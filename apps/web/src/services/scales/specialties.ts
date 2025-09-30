import spec from '../../scales/specialties.json';
export type Specialties = Record<string, string[]>;
export function listSpecialties(): string[] { return Object.keys(spec); }
export function getScalesForSpecialty(name: string): string[] {
  const arr = (spec as Specialties)[name] || [];
  return arr.includes('*') ? [] : arr;
}
