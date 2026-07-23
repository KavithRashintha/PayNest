import pytest
from unittest.mock import patch, AsyncMock
from app.services.ai_agent import ai_agent_service

@pytest.mark.asyncio
async def test_generate_financial_insights():
    mock_summary = {
        "totalBalance": 100000.0,
        "monthlyIncome": 200000.0,
        "monthlyExpense": 50000.0,
        "netSavings": 150000.0
    }
    mock_budgets = [
        {
            "budget": {"categoryName": "Food & Dining", "amountLimit": 30000.0},
            "spentAmount": 15000.0,
            "percentageUsed": 50.0,
            "isExceeded": False
        }
    ]

    with patch("app.services.ai_agent.finance_client.fetch_financial_summary", new_callable=AsyncMock) as mock_sum, \
         patch("app.services.ai_agent.finance_client.fetch_budget_status", new_callable=AsyncMock) as mock_bud:

        mock_sum.return_value = mock_summary
        mock_bud.return_value = mock_budgets

        res = await ai_agent_service.generate_financial_insights(user_id=1)

        assert res["overallHealth"] == "HEALTHY"
        assert res["totalBalance"] == 100000.0
        assert res["monthlyIncome"] == 200000.0
        assert len(res["insights"]) > 0

@pytest.mark.asyncio
async def test_suggest_category():
    res_food = await ai_agent_service.suggest_category(user_id=1, title="Keells Supermarket", description="Weekly groceries")
    assert res_food["suggestedCategory"] == "Food & Dining"
    assert res_food["categoryType"] == "EXPENSE"

    res_salary = await ai_agent_service.suggest_category(user_id=1, title="Monthly Salary Deposit")
    assert res_salary["suggestedCategory"] == "Salary"
    assert res_salary["categoryType"] == "INCOME"

    res_unknown = await ai_agent_service.suggest_category(user_id=1, title="Unknown Merchant XYZ")
    assert res_unknown["suggestedCategory"] == "Other Expense"

@pytest.mark.asyncio
async def test_generate_chat_response_fallback():
    mock_summary = {
        "totalBalance": 75000.0,
        "monthlyIncome": 100000.0,
        "monthlyExpense": 40000.0,
        "netSavings": 60000.0
    }
    mock_budgets = []

    with patch("app.services.ai_agent.finance_client.fetch_financial_summary", new_callable=AsyncMock) as mock_sum, \
         patch("app.services.ai_agent.finance_client.fetch_budget_status", new_callable=AsyncMock) as mock_bud:

        mock_sum.return_value = mock_summary
        mock_bud.return_value = mock_budgets

        response = await ai_agent_service.generate_chat_response(user_id=1, user_message="What is my total balance?")

        assert "75,000.00" in response
