function nowISO(){ return new Date().toISOString(); }

export function buildFhirBundle(data:any){
  const patientId = `Patient/${rnd()}`;
  const encounterId = `Encounter/${rnd()}`;
  const bundle:any = { resourceType:"Bundle", type:"transaction", entry:[] as any[] };

  const patient:any = {
    resourceType:"Patient",
    identifier:(data.patient.identifiers||[]).map((id:any)=>({system:id.system, value:id.value})).filter((x:any)=>x?.value),
    name:[{given:[data.patient.givenName], family:data.patient.familyName}],
    gender:data.patient.gender, birthDate:data.patient.birthDate,
    maritalStatus: data.patient.maritalStatus ? { text:data.patient.maritalStatus } : undefined,
    communication: data.patient.language ? [{ language:{ text:data.patient.language } }] : undefined,
    telecom:(data.patient.telecom||[]).map((t:any)=>({system:t.system, value:t.value, use:t.use}))
  };
  bundle.entry.push(txn("POST", patient, patientId));

  if (data.patient.emergencyContact?.name) {
    bundle.entry.push(txn("POST", {
      resourceType:"RelatedPerson",
      name:[{ text:data.patient.emergencyContact.name }],
      telecom: data.patient.emergencyContact.phone ? [{ system:"phone", value:data.patient.emergencyContact.phone }] : undefined,
      relationship: data.patient.emergencyContact.relationship ? [{ text:data.patient.emergencyContact.relationship }] : undefined,
      patient:{ reference:patientId }
    }));
  }

  if (data.patient.coverage?.memberId || data.patient.coverage?.payer) {
    bundle.entry.push(txn("POST", {
      resourceType:"Coverage", status:"active",
      subscriberId:data.patient.coverage.memberId,
      payor: data.patient.coverage.payer ? [{ display:data.patient.coverage.payer }] : undefined,
      class: data.patient.coverage.plan ? [{ type:{text:"plan"}, value:data.patient.coverage.plan }] : undefined,
      beneficiary:{ reference:patientId }
    }));
  }

  bundle.entry.push(txn("POST", {
    resourceType:"Encounter", status:"in-progress",
    period:{ start:data.encounter.start || nowISO(), end:data.encounter.plannedDischarge },
    reason: data.encounter.reason ? [{ valueCodeableConcept:{ text:data.encounter.reason } }] : undefined,
    subject:{ reference:patientId }
  }, encounterId));

  (data.clinical.diagnoses||[]).forEach((d:any)=>{
    bundle.entry.push(txn("POST", {
      resourceType:"Condition",
      clinicalStatus:{ coding:[{ system:"http://terminology.hl7.org/CodeSystem/condition-clinical", code:"active"}]},
      category:[{ text:"encounter-diagnosis" }],
      code:{ text:d.label, coding: d.code ? [{ system:d.system==="icd10" ? "http://hl7.org/fhir/sid/icd-10":"http://snomed.info/sct", code:d.code, display:d.label }] : undefined },
      subject:{ reference:patientId }, encounter:{ reference:encounterId }, recordedDate: nowISO()
    }));
  });

  (data.clinical.comorbidities||[]).forEach((id:string)=>{
    bundle.entry.push(txn("POST", {
      resourceType:"Condition",
      clinicalStatus:{ coding:[{ system:"http://terminology.hl7.org/CodeSystem/condition-clinical", code:"active"}]},
      code:{ text:id }, subject:{ reference:patientId }, recordedDate: nowISO()
    }));
  });

  (data.clinical.surgeries||[]).forEach((p:any)=>{
    bundle.entry.push(txn("POST", {
      resourceType:"Procedure", status:"completed",
      code: p.code ? { text:p.label, coding:[{ system:"http://snomed.info/sct", code:p.code, display:p.label }] } : { text:p.label },
      performedDateTime:p.date, subject:{ reference:patientId }
    }));
  });

  const v = data.clinical.vitals||{};
  const vit = [
    ["Systolic BP", v.sbp, "mmHg"],
    ["Diastolic BP", v.dbp, "mmHg"],
    ["Heart rate", v.hr, "bpm"],
    ["Respiratory rate", v.rr, "rpm"],
    ["Temperature", v.temp, "°C"],
    ["SpO2", v.spo2, "%"],
    ["Pain NRS", v.pain, undefined],
    ["Glucose", v.glucose, "mg/dL"]
  ];
  vit.forEach(([label,val,unit]:any)=>{
    if (val!==undefined && val!==null && val!=="") {
      bundle.entry.push(txn("POST", {
        resourceType:"Observation", status:"final",
        code:{ text:label }, valueQuantity:{ value:val, unit },
        subject:{ reference:patientId }, encounter:{ reference:encounterId }, effectiveDateTime: nowISO()
      }));
    }
  });

  if (data.carePlan?.summary) {
    bundle.entry.push(txn("POST", {
      resourceType:"CarePlan", status:"active", intent:"plan",
      title:"Plan de cuidados (ADPIE)", description:data.carePlan.summary,
      subject:{ reference:patientId }, period:{ start: nowISO() }
    }));
  }

  if (data.consents?.pdfHash) {
    bundle.entry.push(txn("POST", {
      resourceType:"DocumentReference", status:"current",
      description:"Consentimiento firmado",
      content:[{ attachment:{ title:"Consent.pdf", hash:data.consents.pdfHash, contentType:"application/pdf" } }],
      subject:{ reference:patientId }
    }));
  }
  return bundle;
}

function txn(method:string, resource:any, fullUrl?:string){ return { fullUrl, resource, request:{ method, url:resource.resourceType } }; }
function rnd(){ const s = Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2); return s.slice(0,12); }
