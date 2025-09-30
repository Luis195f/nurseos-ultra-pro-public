import os, json, requests
FHIR = os.getenv("FHIR_BASE_URL", "http://localhost:8080/fhir")
PAT_ID = os.getenv("PATIENT_ID", "P001")
CODE = os.getenv("MED_CODE", "1234567890123")
def req(m,u,**k): r=requests.request(m,u,**k); r.raise_for_status(); return r
def ensure_patient():
  p={"resourceType":"Patient","id":PAT_ID,"name":[{"family":"Demo","given":["Paciente"]}],"gender":"female"}
  req("PUT", f"{FHIR}/Patient/{PAT_ID}", headers={"Content-Type":"application/fhir+json"}, data=json.dumps(p))
def post(res): return req("POST", FHIR, headers={"Content-Type":"application/fhir+json"}, data=json.dumps(res)).json()
def main():
  ensure_patient()
  med=post({"resourceType":"Medication","code":{"coding":[{"system":"urn:gtin","code":CODE,"display":"Medicación Demo"}],"text":"Medicación Demo"}})
  mr=post({"resourceType":"MedicationRequest","status":"active","intent":"order",
           "subject":{"reference":f"Patient/{PAT_ID}"},
           "medicationReference":{"reference":f"Medication/{med['id']}"},
           "dosageInstruction":[{"route":{"text":"oral"},
             "doseAndRate":[{"doseQuantity":{"value":1,"unit":"tablet"}}],
             "timing":{"repeat":{"frequency":3,"period":1,"periodUnit":"d"}}}]} )
  print("Seeded MR:", mr.get("id"))
if __name__=="__main__": main()
