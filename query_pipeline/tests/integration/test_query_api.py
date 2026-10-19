from fastapi.testclient import TestClient

from backend.app.main import app


def test_health_endpoint() -> None:
    response = TestClient(app).get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_query_endpoint_returns_safe_no_ready_status() -> None:
    response = TestClient(app).post(
        "/api/v1/workspaces/workspace-1/query",
        json={"question": "What is this about?", "paper_ids": ["paper-1"]},
    )
    assert response.status_code == 200
    assert response.json()["pipeline_status"] == "no_ready_papers"
