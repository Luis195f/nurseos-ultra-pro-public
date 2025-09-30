from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import scale_agent, doc_agent, abac_agent, validate_agent, audit

app = FastAPI(title="NurseOS Agents Service", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scale_agent.router, prefix="/agents/scale", tags=["scale"])
app.include_router(doc_agent.router, prefix="/agents/doc", tags=["doc"])
app.include_router(abac_agent.router, prefix="/agents/abac", tags=["abac"])
app.include_router(validate_agent.router, prefix="/agents", tags=["validate"])
app.include_router(audit.router, prefix="/audit", tags=["audit"])

@app.get("/healthz")
def healthz():
    return {"status":"ok"}
