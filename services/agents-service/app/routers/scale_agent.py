from fastapi import APIRouter
from pydantic import BaseModel
from typing import Any, Dict
import math

router = APIRouter()

class ScaleRun(BaseModel):
    name: str
    answers: Dict[str, Any] = {}

@router.post("/run")
def run_scale(payload: ScaleRun):
    # Prototipo simple: soporta 'braden' y 'katz' con lógica mínima
    name = payload.name.lower()
    if name == "braden":
        # valores ficticios mínimos
        score = 12
        risk = "Alto" if score <= 12 else "Moderado" if score <= 16 else "Bajo"
        return {"scale":"braden","result":{"score":score, "risk":risk}}
    if name == "katz":
        # 0-6 (independencia)
        score = 4
        return {"scale":"katz","result":{"score":score}}
    return {"scale": name, "result": {"note": "implementación base; añade tu lógica de cálculo"}}
