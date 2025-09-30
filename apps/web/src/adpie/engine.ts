import nnn from "./nnn-suggestions.json";

export type PatientContext = {
  vitals?: { spo2?:number; rr?:number; temp?:number; hr?:number; sbp?:number; dbp?:number; glucose?:number };
  scales?: { news2?:number; news2AnyParam?:number; morse?:number; braden?:number; nrsPain?:number };
  flags?: { anticoagulated?:boolean; fallsHistory?:boolean; pressureInjury?:boolean; endOfLife?:boolean };
};

export type AdpieSuggestion = {
  id: string;
  diagnosis: string;
  outcomes: string[];
  interventions: string[];
  evidence: string;
};

function get(path: string, obj: any) {
  return path.split(".").reduce((o,k)=>o?.[k], obj);
}

export function runAdpieEngine(ctx: PatientContext): AdpieSuggestion[] {
  const out: AdpieSuggestion[] = [];
  const rules = (nnn as any).rules as any[];

  const facts = {
    morse: ctx.scales?.morse ?? null,
    braden: ctx.scales?.braden ?? null,
    news2_any: ctx.scales?.news2AnyParam ?? null,
    glucose: ctx.vitals?.glucose ?? null,
  };

  for (const r of rules) {
    const cond = r.when || {};
    let ok = true;
    for (const key of Object.keys(cond)) {
      const exp = cond[key];
      const val = (facts as any)[key];
      if (exp.gte !== undefined && !(val !== null && val >= exp.gte)) ok = false;
      if (exp.lte !== undefined && !(val !== null && val <= exp.lte)) ok = false;
    }
    if (ok) {
      out.push({
        id: r.id,
        diagnosis: r.suggest.diagnosis,
        outcomes: r.suggest.outcomes || [],
        interventions: r.suggest.interventions || [],
        evidence: r.evidence || ""
      });
    }
  }
  return out;
}
