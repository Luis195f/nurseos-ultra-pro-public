# NurseOS Agents Service (FastAPI)

Microservicio multiagente (prototipo) para NurseOS:
- Agente de Escalas
- Agente de Documentación (estructurar nota → FHIR)
- Agente ABAC (consulta a OPA/Keycloak - stub)
- Agente Validador (HL7 FHIR Validator - stub configurable)
- Orquestador simple (plan → act → check)

> Seguridad: no enviar PHI fuera. Este servicio está pensado para ejecutarse **on‑prem**.

## Variables de entorno
- `FHIR_BASE` (ej: http://localhost:8080/fhir)
- `OPA_URL` (ej: http://localhost:8181/v1/data/fhir/allow)
- `FHIR_VALIDATOR_CLI` (ruta a `java -jar validator_cli.jar`, opcional; si no está, la validación devuelve `skipped`)
- `OPENAI_API_KEY` o proveedores on‑prem (opcional si quieres LLM externo para tareas no-PHI)

## Ejecutar local
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8070 --reload
```
