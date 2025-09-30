from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()
class Event(BaseModel):
    ts: str; user: str; action: str; resourceType: str
    patientId: Optional[str] = None; allow: Optional[bool] = None
    reason: Optional[str] = None; details: Optional[dict] = None
_events: List[Event] = []

@router.post("/log")
def log_event(ev: Event):
    _events.append(ev)
    if len(_events) > 1000: del _events[:len(_events)-1000]
    return {"status":"ok","count":len(_events)}

@router.get("/events")
def list_events(limit: int = 200):
    return list(reversed(_events))[:limit]
