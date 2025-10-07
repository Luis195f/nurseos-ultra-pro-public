from fastapi import FastAPI
from pydantic import BaseModel
from typing import Literal, Dict, Any

app = FastAPI(title="agents-service")

class ScaleReq(BaseModel):
    scale: Literal["news2"]
    input: Dict[str, Any]

def news2_calculate(inp: Dict[str, Any]) -> Dict[str, Any]:
    rr = int(inp.get("rr", 0))
    spo2 = int(inp.get("spo2", 0))
    sbp = int(inp.get("sbp", 0))
    hr = int(inp.get("hr", 0))
    temp = float(inp.get("temp", 0))
    avpu = str(inp.get("avpu", "A"))
    o2 = bool(inp.get("o2", False))

    def s_rr(x):   return 3 if x<=8 else 1 if x<=11 else 0 if x<=20 else 2 if x<=24 else 3
    def s_spo2(x): return 0 if x>=96 else 1 if x>=94 else 2 if x>=92 else 3
    def s_sbp(x):  return 3 if x<=90 else 2 if x<=100 else 1 if x<=110 else 0 if x<=219 else 3
    def s_hr(x):   return 3 if x<=40 else 1 if x<=50 else 0 if x<=90 else 1 if x<=110 else 2 if x<=130 else 3
    def s_temp(x): return 3 if x<=35 else 1 if x<=36 else 0 if x<=38 else 1 if x<=39 else 2
    def s_avpu(x): return 0 if x == "A" else 3

    score = s_rr(rr)+s_spo2(spo2)+s_sbp(sbp)+s_hr(hr)+s_temp(temp)+s_avpu(avpu)
    if o2:
        score += 2
    band = "alta" if score >= 7 else "media" if score >= 5 else "baja"
    return {"score": score, "band": band}

@app.post("/scales")
def post_scales(req: ScaleReq):
    if req.scale == "news2":
        return news2_calculate(req.input)
    return {"error": "scale not implemented"}

@app.post("/validate-bundle")
def validate_bundle(bundle: Dict[str, Any]):
    # stub: en real llamaría a validador externo si existe
    return {"issues": []}

@app.get("/search")
def search(q: str):
    # stub RAG local
    return {"results": []}
