import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent.parent / "backend"))
from fastapi.testclient import TestClient
from main import app, DB

client = TestClient(app)

def setup_function():
    DB.clear()

def test_footprint_calculation():
    r = client.post("/footprint", json={"user": "a", "kwh": 100, "lpg": 1, "petrol": 10, "meat": 0})
    assert r.status_code == 200
    expected = round(100 * 0.82 + 14.2 * 2.98 + 10 * 2.31)
    assert r.json()["kg_co2e_month"] == expected

def test_footprint_zero():
    r = client.post("/footprint", json={"user": "a", "kwh": 0, "lpg": 0, "petrol": 0, "meat": 0})
    assert r.json()["kg_co2e_month"] == 0

def test_footprint_rejects_bad_input():
    r = client.post("/footprint", json={"user": "a", "kwh": "x", "lpg": 0, "petrol": 0, "meat": 0})
    assert r.status_code == 422

def test_points_accumulate():
    client.post("/points/asha/10")
    r = client.post("/points/asha/10")
    assert r.json() == {"user": "asha", "points": 20}

def test_leaderboard_sorted():
    client.post("/points/a/5"); client.post("/points/b/15"); client.post("/points/c/10")
    assert [u for u, _ in client.get("/leaderboard").json()] == ["b", "c", "a"]
