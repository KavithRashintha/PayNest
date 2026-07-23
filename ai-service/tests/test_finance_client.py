import pytest
from unittest.mock import patch, AsyncMock
import httpx
from app.services.finance_client import FinanceClient

@pytest.mark.asyncio
async def test_fetch_financial_summary_success():
    client = FinanceClient(base_url="http://localhost:8082")
    mock_data = {
        "totalBalance": 50000.0,
        "monthlyIncome": 150000.0,
        "monthlyExpense": 45000.0,
        "netSavings": 105000.0
    }

    dummy_request = httpx.Request("GET", "http://localhost:8082/api/finance/analytics/summary")
    mock_response = httpx.Response(200, json=mock_data, request=dummy_request)

    with patch.object(httpx.AsyncClient, "get", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = mock_response

        res = await client.fetch_financial_summary(user_id=100)

        assert res == mock_data
        mock_get.assert_called_once()
        args, kwargs = mock_get.call_args
        assert "http://localhost:8082/api/finance/analytics/summary" in args[0]
        assert kwargs["headers"]["X-User-Id"] == "100"

@pytest.mark.asyncio
async def test_fetch_recent_transactions_success():
    client = FinanceClient(base_url="http://localhost:8082")
    mock_data = {
        "content": [
            {"id": 1, "title": "Supermarket", "amount": 2500.0, "type": "EXPENSE"}
        ],
        "totalElements": 1
    }

    dummy_request = httpx.Request("GET", "http://localhost:8082/api/finance/transactions")
    mock_response = httpx.Response(200, json=mock_data, request=dummy_request)

    with patch.object(httpx.AsyncClient, "get", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = mock_response

        res = await client.fetch_recent_transactions(user_id=100, page=0, size=20)

        assert res == mock_data
        mock_get.assert_called_once()
        args, kwargs = mock_get.call_args
        assert "http://localhost:8082/api/finance/transactions" in args[0]
        assert kwargs["headers"]["X-User-Id"] == "100"

@pytest.mark.asyncio
async def test_fetch_budget_status_success():
    client = FinanceClient(base_url="http://localhost:8082")
    mock_data = [
        {"spentAmount": 12000.0, "remainingAmount": 3000.0, "percentageUsed": 80.0, "isExceeded": False}
    ]

    dummy_request = httpx.Request("GET", "http://localhost:8082/api/finance/budgets/status")
    mock_response = httpx.Response(200, json=mock_data, request=dummy_request)

    with patch.object(httpx.AsyncClient, "get", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = mock_response

        res = await client.fetch_budget_status(user_id=100)

        assert res == mock_data
        mock_get.assert_called_once()
        args, kwargs = mock_get.call_args
        assert "http://localhost:8082/api/finance/budgets/status" in args[0]
        assert kwargs["headers"]["X-User-Id"] == "100"
