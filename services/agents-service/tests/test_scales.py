from fastapi.testclient import TestClient
import os, sys

BASE_DIR = os.path.dirname(os.path.dirname(__file__))  # .../services/agents-service
sys.path.append(BASE_DIR)

from main import app

c = TestClient(app)

def test_news2():
    r = c.post("/scales", json={"scale":"news2","input":{"rr":30,"spo2":90,"sbp":85,"hr":140,"temp":34,"avpu":"P","o2":True}})
    assert r.status_code == 200
    assert r.json()["band"] == "alta"
