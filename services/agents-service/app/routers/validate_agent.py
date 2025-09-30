from fastapi import APIRouter
from pydantic import BaseModel
import os, subprocess, json, tempfile

router = APIRouter()

class ValidateReq(BaseModel):
    resources: list

@router.post("/validate")
def validate(req: ValidateReq):
    cli = os.getenv("FHIR_VALIDATOR_CLI")
    if not cli:
        return {"status":"skipped","reason":"FHIR_VALIDATOR_CLI no configurado"}
    # Escribe bundle temporal y lanza validator
    bundle = {"resourceType":"Bundle","type":"collection","entry":[{"resource":r} for r in req.resources]}
    with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False) as f:
        json.dump(bundle, f)
        tmp = f.name
    try:
        out = subprocess.run(cli.split()+[tmp], capture_output=True, text=True, check=False)
        ok = out.returncode == 0
        return {"status": "passed" if ok else "failed", "stdout": out.stdout[-2000:], "stderr": out.stderr[-2000:]}
    finally:
        pass
