import pytest
from unittest.mock import patch, AsyncMock
from app.services.ai_agent import ai_agent_service

MOCK_SUMMARY_HEALTHY = {
    "totalBalance": 100000.0,
    "monthlyIncome": 200000.0,
    "monthlyExpense": 50000.0,
    "netSavings": 150000.0
}

MOCK_SUMMARY_NEGATIVE = {
    "totalBalance": 103450.0,
    "monthlyIncome": 0.0,
    "monthlyExpense": 6550.0,
    "netSavings": -6550.0
}

MOCK_BUDGETS = [
    {
        "budget": {"categoryName": "Food & Dining", "amountLimit": 30000.0},
        "spentAmount": 15000.0,
        "percentageUsed": 50.0,
        "isExceeded": False
    }
]


# ─────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────

async def chat(user_message, summary, budgets=None, chat_history=None):
    """Unwraps tuple from generate_chat_response — returns (response_text, actions_taken)."""
    with patch("app.services.ai_agent.finance_client.fetch_financial_summary", new_callable=AsyncMock) as mock_sum, \
         patch("app.services.ai_agent.finance_client.fetch_budget_status", new_callable=AsyncMock) as mock_bud:
        mock_sum.return_value = summary
        mock_bud.return_value = budgets or []
        return await ai_agent_service.generate_chat_response(
            user_id=1, user_message=user_message, chat_history=chat_history
        )


# ─────────────────────────────────────────────
# Tests
# ─────────────────────────────────────────────

@pytest.mark.asyncio
async def test_generate_financial_insights():
    with patch("app.services.ai_agent.finance_client.fetch_financial_summary", new_callable=AsyncMock) as mock_sum, \
         patch("app.services.ai_agent.finance_client.fetch_budget_status", new_callable=AsyncMock) as mock_bud:
        mock_sum.return_value = MOCK_SUMMARY_HEALTHY
        mock_bud.return_value = MOCK_BUDGETS
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
async def test_generate_chat_response_returns_tuple():
    """generate_chat_response must return (str, list) tuple."""
    response, actions = await chat("What is my total balance?", {"totalBalance": 75000.0, "monthlyIncome": 100000.0, "monthlyExpense": 40000.0, "netSavings": 60000.0})
    assert isinstance(response, str)
    assert isinstance(actions, list)


@pytest.mark.asyncio
async def test_generate_chat_response_balance_query():
    response, _ = await chat("What is my total balance?", {"totalBalance": 75000.0, "monthlyIncome": 100000.0, "monthlyExpense": 40000.0, "netSavings": 60000.0})
    assert "75,000.00" in response


@pytest.mark.asyncio
async def test_purchase_scenario_without_interest():
    """Test basic installment scenario without interest."""
    response, actions = await chat(
        "What if I buy a phone worth around 45000 for 12 months installment?",
        MOCK_SUMMARY_NEGATIVE
    )
    assert "45,000.00" in response
    assert "3,750.00" in response
    assert "RECOMMENDED" in response or "RISK" in response


@pytest.mark.asyncio
async def test_purchase_scenario_with_monthly_interest():
    """Test installment scenario WITH monthly interest rate."""
    response, _ = await chat(
        "What if I buy a phone worth 45000 on credit card for 12 months installment with 2.5% interest per month?",
        MOCK_SUMMARY_NEGATIVE
    )
    assert "45,000.00" in response
    assert "2.50%" in response
    assert "Interest" in response
    assert "RECOMMENDED" in response or "RISK" in response


@pytest.mark.asyncio
async def test_followup_interest_change():
    """Follow-up question 'What if the interest is 4%?' should reuse previous scenario."""
    chat_history = [
        {"role": "user", "content": "What if I buy a phone worth 45000 on credit card for 12 months installment with 2.5% interest?"},
        {"role": "assistant", "content": "Financial Impact Analysis..."},
    ]
    response, _ = await chat(
        "What if the monthly interest is 4%?",
        MOCK_SUMMARY_NEGATIVE,
        chat_history=chat_history
    )
    assert "45,000.00" in response
    assert "4.00%" in response
    assert "RECOMMENDED" in response or "RISK" in response


@pytest.mark.asyncio
async def test_followup_tenure_change():
    """Follow-up changing tenure should work."""
    chat_history = [
        {"role": "user", "content": "What if I buy a laptop worth 150000 for 12 months installment?"},
        {"role": "assistant", "content": "Financial Impact Analysis..."},
    ]
    response, _ = await chat(
        "What about 24 months instead?",
        MOCK_SUMMARY_HEALTHY,
        chat_history=chat_history
    )
    assert "150,000.00" in response
    assert "24 months" in response


@pytest.mark.asyncio
async def test_savings_tips_query():
    """Asking for savings tips returns tips."""
    response, _ = await chat("Give me tips to save money", MOCK_SUMMARY_HEALTHY)
    assert "save" in response.lower() or "tip" in response.lower() or "50/30/20" in response


@pytest.mark.asyncio
async def test_create_budget_intent_detected():
    """Rules-based fallback should detect budget creation intent and attempt API call."""
    with patch("app.services.ai_agent.finance_client.fetch_financial_summary", new_callable=AsyncMock) as mock_sum, \
         patch("app.services.ai_agent.finance_client.fetch_budget_status", new_callable=AsyncMock) as mock_bud, \
         patch("app.services.ai_agent.finance_client.resolve_category_id", new_callable=AsyncMock) as mock_cat, \
         patch("app.services.ai_agent.finance_client.create_budget", new_callable=AsyncMock) as mock_create:

        mock_sum.return_value = MOCK_SUMMARY_HEALTHY
        mock_bud.return_value = []
        mock_cat.return_value = 1  # Simulated category ID
        mock_create.return_value = {"success": True, "data": {"id": 10}}

        response, actions = await ai_agent_service.generate_chat_response(
            user_id=1,
            user_message="Set a monthly budget of 25000 for Food & Dining"
        )
        assert "25,000.00" in response or "budget" in response.lower()
        assert len(actions) == 1
        assert "Food" in actions[0] or "budget" in actions[0].lower()


@pytest.mark.asyncio
async def test_log_transaction_intent_detected():
    """Rules-based fallback should detect transaction log intent and attempt API call."""
    with patch("app.services.ai_agent.finance_client.fetch_financial_summary", new_callable=AsyncMock) as mock_sum, \
         patch("app.services.ai_agent.finance_client.fetch_budget_status", new_callable=AsyncMock) as mock_bud, \
         patch("app.services.ai_agent.finance_client.resolve_category_id", new_callable=AsyncMock) as mock_cat, \
         patch("app.services.ai_agent.finance_client.resolve_account_id", new_callable=AsyncMock) as mock_acc, \
         patch("app.services.ai_agent.finance_client.create_transaction", new_callable=AsyncMock) as mock_create:

        mock_sum.return_value = MOCK_SUMMARY_HEALTHY
        mock_bud.return_value = []
        mock_cat.return_value = 2
        mock_acc.return_value = 1
        mock_create.return_value = {"success": True, "data": {"id": 99}}

        response, actions = await ai_agent_service.generate_chat_response(
            user_id=1,
            user_message="Log a 3500 expense for groceries"
        )
        assert "3,500.00" in response or "logged" in response.lower() or "transaction" in response.lower()
        assert len(actions) == 1
