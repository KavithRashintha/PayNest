from fastapi import FastAPI, Depends
from fastapi.testclient import TestClient
from app.api.deps import get_current_user, CurrentUser

test_app = FastAPI()

@test_app.get("/protected")
def protected_route(current_user: CurrentUser = Depends(get_current_user)):
    return {"user_id": current_user.id, "email": current_user.email}

client = TestClient(test_app)

def test_missing_auth_returns_401():
    response = client.get("/protected")
    assert response.status_code == 401
    assert "User authentication required" in response.json()["detail"]

def test_valid_gateway_header_returns_user():
    headers = {"X-User-Id": "42", "X-User-Email": "test@paynest.com"}
    response = client.get("/protected", headers=headers)
    assert response.status_code == 200
    assert response.json() == {"user_id": 42, "email": "test@paynest.com"}

def test_invalid_header_id_returns_401():
    headers = {"X-User-Id": "invalid"}
    response = client.get("/protected", headers=headers)
    assert response.status_code == 401
    assert "Invalid X-User-Id header format" in response.json()["detail"]
