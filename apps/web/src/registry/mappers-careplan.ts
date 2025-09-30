export function buildCarePlanBundle(sels: { diagnosis:string; outcomes:string[]; interventions:string[] }[]) {
  const carePlan = {
    resourceType: "CarePlan",
    status: "active",
    intent: "plan",
    title: "Plan de cuidados (no oficial)",
    description: "Sugerencias generadas por reglas abiertas",
    activity: (sels || []).map(s => ({
      detail: { kind: "ServiceRequest", status:"scheduled", description: `${s.diagnosis}: ${s.interventions.join(", ")}` }
    })),
    goal: (sels || []).map(s => ({
      description: { text: s.outcomes.join("; ") }
    }))
  };
  return { resourceType:"Bundle", type:"transaction", entry:[
    { resource: carePlan, request:{ method:"POST", url:"CarePlan" } }
  ]};
}
