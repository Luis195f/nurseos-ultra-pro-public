export function buildConsentBundle(patientId: string, pdfHashHex: string, pdfBytesB64: string) {
  const doc: any = {
    resourceType: "DocumentReference",
    status: "current",
    subject: { reference: `Patient/${patientId}` },
    content: [{ attachment: { contentType: "application/pdf", data: pdfBytesB64, hash: pdfHashHex, title: "Consent.pdf" } }]
  };
  const consent: any = {
    resourceType: "Consent",
    status: "active",
    scope: { text: "treatment" },
    patient: { reference: `Patient/${patientId}` }
  };
  return {
    resourceType:"Bundle", type:"transaction", entry:[
      { resource: doc, request:{ method:"POST", url:"DocumentReference"} },
      { resource: consent, request:{ method:"POST", url:"Consent"} }
    ]
  };
}
