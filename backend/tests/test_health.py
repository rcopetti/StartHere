from __future__ import annotations

from fastapi.testclient import TestClient


def test_health_reports_configuration(client: TestClient) -> None:
    response = client.get("/healthz")

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["auth"] == "firebase"
    assert body["model"] == "fake/model"
    assert body["environment"] == "test"


def test_health_needs_no_token(auth_client: TestClient) -> None:
    assert auth_client.get("/healthz").status_code == 200


def test_security_headers_are_present(client: TestClient) -> None:
    response = client.get("/healthz")

    assert response.headers["X-Content-Type-Options"] == "nosniff"
    assert response.headers["X-Request-ID"]
