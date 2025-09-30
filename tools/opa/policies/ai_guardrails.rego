package ai.guardrails

# No permitir que la IA emita diagnóstico médico definitivo
deny_reason[msg] if {
  lower(input.intent) == "diagnostico"
  msg := "La IA no emite diagnósticos. Requiere revisión humana."
}

# Exigir disclaimer de supervisión enfermera
require_disclaimer if {
  input.feature == "ai_advice"
}
