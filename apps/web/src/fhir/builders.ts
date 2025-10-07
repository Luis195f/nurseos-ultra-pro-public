type Priority = "baja" | "media" | "alta";

export function buildHandoverBundle(
  form: { patientId: string; authorId: string; news2: number; notes?: string; invasive?: boolean; },
  state: { priority: Priority }
) {
  const now = new Date().toISOString();
  const pid = form.patientId;
  const cid = "composition-" + Math.random().toString(36).slice(2,9);
  const o1  = "obs-news2-"  + Math.random().toString(36).slice(2,9);
  const o2  = "obs-prio-"   + Math.random().toString(36).slice(2,9);

  const composition = {
    resourceType: "Composition",
    status: "final",
    type: { coding: [{ system: "http://loinc.org", code: "11506-3", display: "Progress note" }]},
    subject: { reference: `Patient/${pid}` },
    date: now,
    author: [{ reference: `Practitioner/${form.authorId}` }],
    title: "Handover PRO",
    section: form.notes ? [{ text: { status: "generated", div: `<div>${form.notes}</div>` } }] : []
  };

  const obsNews2 = {
    resourceType: "Observation",
    status: "final",
    code: { coding: [{ system: "http://loinc.org", code: "89263-0", display: "NEWS2 total score" }]},
    subject: { reference: `Patient/${pid}` },
    effectiveDateTime: now,
    valueInteger: form.news2
  };

  const obsPriority = {
    resourceType: "Observation",
    status: "final",
    code: { coding: [{ system: "http://snomed.info/sct", code: "763264000", display: "Clinical priority" }]},
    subject: { reference: `Patient/${pid}` },
    effectiveDateTime: now,
    valueString: state.priority
  };

  const prov = {
    resourceType: "Provenance",
    recorded: now,
    agent: [{ who: { reference: `Practitioner/${form.authorId}` } }],
    target: [{ reference: `urn:uuid:${cid}` }]
  };

  return {
    resourceType: "Bundle",
    type: "transaction",
    entry: [
      { fullUrl:`urn:uuid:${cid}`, resource: composition,  request:{ method:"POST", url:"Composition" } },
      { fullUrl:`urn:uuid:${o1}`,  resource: obsNews2,     request:{ method:"POST", url:"Observation" } },
      { fullUrl:`urn:uuid:${o2}`,  resource: obsPriority,  request:{ method:"POST", url:"Observation" } },
      { resource: prov,            request:{ method:"POST", url:"Provenance"  } },
    ]
  };
}
