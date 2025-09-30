from fastapi import APIRouter
from pydantic import BaseModel
import os, httpx

router = APIRouter()

class AbacReq(BaseModel):
    action: str
    resourceType: str
    context: dict = {}

@router.post("/eval")
async def abac_eval(req: AbacReq):
    opa_url = os.getenv("OPA_URL")
    # Si no hay OPA_URL -> modo dev permisivo
    if not opa_url:
        return {"allow": True, "reason":"OPA_URL no configurado (permitiendo en dev)"}
    payload = {"input":{"action":req.action,"resourceType":req.resourceType,"subject":req.context}}
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            r = await client.post(opa_url, json=payload)
            r.raise_for_status()
            data = r.json()
        allow = bool(data.get("result", False)) if isinstance(data, dict) else False
        return {"allow": allow, "reason": "OPA decision"}
    except Exception as e:
        # Fallback seguro: no romper el flujo si OPA está caído
        return {"allow": True, "reason": f"OPA no disponible ({e}); dev-allow"}
