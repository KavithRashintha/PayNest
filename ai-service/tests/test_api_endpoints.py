import pytest
from unittest.mock import patch, AsyncMock
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

HEADERS = {
    "X-User-Id": "100",
    "X-User-Email": "test@paynest.com"
}

def test_health_check():
    response = client.get("/api/ai/health")
    assert response.status_code == 200
    assert response.json()["status"] == "UP"
    assert response.json()["service"] == "PayNest AI Agent Service"

def test_chat_endpoint_unauthorized():
    response = client.post("/api/ai/chat", json={"message": "Hello"})
    assert response.status_code == 401

def test_chat_endpoint_success():
    mock_summary = {
        "totalBalance": 50000.0,
        "monthlyIncome": 100000.0,
        "monthlyExpense": 30000.0,
        "netSavings": 70000.0
    }
    mock_budgets = []

    with patch("app.services.ai_agent.finance_client.fetch_financial_summary", new_callable=AsyncMock) as mock_sum, \
         patch("app.services.ai_agent.finance_client.fetch_budget_status", new_callable=AsyncMock) as mock_bud:

        mock_sum.return_value = mock_summary
        mock_bud.return_value = mock_budgets

        payload = {"message": "How am I doing financially?"}
        response = client.post("/api/ai/chat", json=payload, headers=HEADERS)

        assert response.status_code == 200
        assert "response" in response.json()
        assert len(response.json()["response"]) > 0

def test_insights_endpoint_success():
    mock_summary = {
        "totalBalance": 50000.0,
        "monthlyIncome": 100000.0,
        "monthlyExpense": 30000.0,
        "netSavings": 70000.0
    }
    mock_budgets = []

    with patch("app.services.ai_agent.finance_client.fetch_financial_summary", new_callable=AsyncMock) as mock_sum, \
         patch("app.services.ai_agent.finance_client.fetch_budget_status", new_callable=AsyncMock) as mock_bud:

        mock_sum.return_value = mock_summary
        mock_bud.return_value = mock_budgets

        response = client.get("/api/ai/insights", headers=HEADERS)

        assert response.status_code == 200
        data = response.json()
        assert data["overallHealth"] == "HEALTHY"
        assert data["totalBalance"] == 50000.0
        assert isinstance(data["insights"], list)

def test_categorize_endpoint_success():
    payload = {
        "title": "Keells Supermarket",
        "description": "Weekly food shopping"
    }
    response = client.post("/api/ai/categorize", json=payload, headers=HEADERS)

    assert response.status_code == 200
    data = response.json()
    assert data["suggestedCategory"] == "Food & Dining"
    assert data["categoryType"] == "EXPENSE"
    assert data["confidence"] > 0.8
