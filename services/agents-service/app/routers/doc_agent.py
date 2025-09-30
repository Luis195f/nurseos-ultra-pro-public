from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any

router = APIRouter()

class StructureReq(BaseModel):
    note: str

@router.post("/structure")
def structure(req: StructureReq):
    # Prototipo: crea un pequeño bundle Observation + CarePlan sugerido
    obs = {
        "resourceType":"Observation",
        "status":"preliminary",
        "code":{"text":"Dolor (NRS)"},
        "valueQuantity":{"value":6,"unit":"/10","system":"http://unitsofmeasure.org","code":"/10"}
    }
    careplan = {
        "resourceType":"CarePlan",
        "status":"draft",
        "intent":"plan",
        "title":"Plan de cuidados inicial (prototipo)",
        "activity":[{"detail":{"kind":"ServiceRequest","description":"Cambios posturales cada 2h; Colchón antiescaras"}}]
    }
    return {"resources":[obs, careplan]}