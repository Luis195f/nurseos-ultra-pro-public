package fhir

default allow := false

# Ejemplo: permitir crear CarePlan si rol es nurse
allow if {
  input.action == "create"
  input.resourceType == "CarePlan"
  input.context.role == "nurse"
}
