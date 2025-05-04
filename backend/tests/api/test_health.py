from fastapi.testclient import TestClient

from app.app import app

client = TestClient(app)


def test_health_check():
    """Test health check endpoint"""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["api_version"] == "v1"
    # Note: database_connected might be False in tests without a DB connection
