"""
agent_tools.py
──────────────
Defines all LangChain-compatible tools the PayNest Agentic AI can call.

Each tool function is a plain async coroutine that accepts `user_id` through
a shared context dict injected at agent build-time. The tools are converted to
LangChain StructuredTools so the LLM can choose which to invoke and supply
the right arguments.

Agentic tool catalogue:
  READ:
    - get_financial_summary   — live balance, income, expenses, net savings
    - get_budget_status       — all active budget statuses
    - get_accounts            — all user accounts
  WRITE (actions):
    - create_budget           — set a spending limit for a category
    - log_transaction         — record an income or expense transaction
  COMPUTE:
    - analyze_purchase_scenario — EMI / instalment feasibility analysis (local)
"""

import math
import logging
from typing import Dict, Any, List, Optional

from app.services.finance_client import finance_client

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# Tool Builder
# Called once per request with the resolved user_id so tools don't need to
# accept user_id as an LLM argument (avoids hallucination risk).
# ─────────────────────────────────────────────────────────────────────────────

def build_agent_tools(user_id: int):
    """
    Returns a list of LangChain StructuredTools scoped to a specific user_id.
    Import is deferred so the module loads even without langchain installed.
    """
    try:
        from langchain_core.tools import StructuredTool
        from pydantic import BaseModel, Field
    except ImportError:
        logger.warning("langchain_core not available — agentic tools cannot be built.")
        return []

    # ── Schema definitions ──────────────────────────────────────────────────

    class EmptyInput(BaseModel):
        pass  # No arguments needed

    class CreateBudgetInput(BaseModel):
        category_name: str = Field(
            ...,
            description="The spending category name to set a budget for, e.g. 'Food & Dining', 'Shopping'."
        )
        amount_limit: float = Field(
            ...,
            description="The maximum spending limit in LKR for this category per period."
        )
        period: str = Field(
            default="MONTHLY",
            description="Budget period: MONTHLY, WEEKLY, or YEARLY. Default is MONTHLY."
        )

    class LogTransactionInput(BaseModel):
        amount: float = Field(
            ...,
            description="The transaction amount in LKR (positive number)."
        )
        transaction_type: str = Field(
            ...,
            description="Type of transaction: INCOME or EXPENSE."
        )
        category_name: str = Field(
            ...,
            description="The category name for this transaction, e.g. 'Food & Dining', 'Salary'."
        )
        description: str = Field(
            ...,
            description="A short description or title of what this transaction is for."
        )
        account_name: Optional[str] = Field(
            default=None,
            description="Account name or type to use (e.g. 'Cash', 'Bank', 'Credit Card'). Defaults to first available account."
        )

    class AnalyzeScenarioInput(BaseModel):
        purchase_amount: float = Field(
            ..., description="Total purchase price in LKR."
        )
        tenure_months: int = Field(
            ..., description="Number of months for the instalment plan."
        )
        monthly_interest_rate_pct: float = Field(
            default=0.0,
            description="Monthly interest rate as a percentage (e.g. 2.5 for 2.5%). Use 0 for 0% interest."
        )

    # ── Tool coroutines ─────────────────────────────────────────────────────

    async def _get_financial_summary() -> str:
        data = await finance_client.fetch_financial_summary(user_id)
        if not data:
            return "Could not retrieve financial summary — finance service may be unavailable."
        return (
            f"Total Balance: LKR {data.get('totalBalance', 0):,.2f} | "
            f"Monthly Income: LKR {data.get('monthlyIncome', 0):,.2f} | "
            f"Monthly Expense: LKR {data.get('monthlyExpense', 0):,.2f} | "
            f"Net Savings: LKR {data.get('netSavings', 0):,.2f}"
        )

    async def _get_budget_status() -> str:
        budgets = await finance_client.fetch_budget_status(user_id)
        if not budgets:
            return "No active budgets found."
        lines = []
        for b in budgets:
            info = b.get("budget", {})
            cat = info.get("categoryName", "Unknown")
            spent = b.get("spentAmount", 0.0)
            limit = info.get("amountLimit", 0.0)
            pct = b.get("percentageUsed", 0.0)
            exceeded = "⚠️ EXCEEDED" if b.get("isExceeded") else ""
            lines.append(f"  {cat}: LKR {spent:,.2f} / {limit:,.2f} ({pct:.1f}%) {exceeded}")
        return "Budget Status:\n" + "\n".join(lines)

    async def _get_accounts() -> str:
        accounts = await finance_client.fetch_user_accounts(user_id)
        if not accounts:
            return "No accounts found."
        lines = [
            f"  {a.get('name')} ({a.get('accountType')}): LKR {a.get('balance', 0):,.2f}"
            for a in accounts
        ]
        return "Accounts:\n" + "\n".join(lines)

    async def _create_budget(category_name: str, amount_limit: float, period: str = "MONTHLY") -> str:
        # Resolve category name → ID
        cat_id = await finance_client.resolve_category_id(user_id, category_name)
        if cat_id is None:
            return (
                f"Could not find a category matching '{category_name}'. "
                f"Please check the available categories and try again."
            )

        period = period.upper()
        if period not in ("MONTHLY", "WEEKLY", "YEARLY"):
            period = "MONTHLY"

        result = await finance_client.create_budget(user_id, cat_id, amount_limit, period)
        if result.get("success"):
            return f"✅ Budget created: '{category_name}' — LKR {amount_limit:,.2f}/{period.lower().rstrip('ly')}ly"
        else:
            err = result.get("error", "Unknown error")
            return f"❌ Failed to create budget for '{category_name}': {err}"

    async def _log_transaction(
        amount: float,
        transaction_type: str,
        category_name: str,
        description: str,
        account_name: Optional[str] = None
    ) -> str:
        # Resolve IDs
        cat_id = await finance_client.resolve_category_id(user_id, category_name)
        if cat_id is None:
            return f"Could not find category '{category_name}'. Please check category names and try again."

        acc_id = await finance_client.resolve_account_id(user_id, account_name)
        if acc_id is None:
            return "No accounts found to log this transaction against. Please add an account first."

        tx_type = transaction_type.upper()
        if tx_type not in ("INCOME", "EXPENSE", "TRANSFER"):
            tx_type = "EXPENSE"

        result = await finance_client.create_transaction(
            user_id=user_id,
            account_id=acc_id,
            category_id=cat_id,
            amount=abs(amount),
            transaction_type=tx_type,
            description=description,
            title=description
        )
        if result.get("success"):
            return (
                f"✅ Transaction logged: {tx_type} of LKR {abs(amount):,.2f} "
                f"for '{description}' under '{category_name}'"
            )
        else:
            err = result.get("error", "Unknown error")
            return f"❌ Failed to log transaction: {err}"

    def _analyze_purchase_scenario(
        purchase_amount: float,
        tenure_months: int,
        monthly_interest_rate_pct: float = 0.0
    ) -> str:
        if tenure_months < 1:
            tenure_months = 1

        if monthly_interest_rate_pct > 0:
            r = monthly_interest_rate_pct / 100.0
            n = tenure_months
            emi = purchase_amount * r * math.pow(1 + r, n) / (math.pow(1 + r, n) - 1)
            total_payable = emi * n
            total_interest = total_payable - purchase_amount
        else:
            emi = purchase_amount / tenure_months
            total_payable = purchase_amount
            total_interest = 0.0

        lines = [
            f"Purchase Amount: LKR {purchase_amount:,.2f}",
            f"Tenure: {tenure_months} months",
        ]
        if monthly_interest_rate_pct > 0:
            lines.append(f"Monthly Interest Rate: {monthly_interest_rate_pct:.2f}%")
        lines += [
            f"Monthly Instalment (EMI): LKR {emi:,.2f}",
            f"Total Interest Cost: LKR {total_interest:,.2f}",
            f"Total Amount Payable: LKR {total_payable:,.2f}",
        ]
        return "\n".join(lines)

    # ── Build StructuredTool list ────────────────────────────────────────────

    tools = [
        StructuredTool.from_function(
            coroutine=_get_financial_summary,
            name="get_financial_summary",
            description=(
                "Fetches the user's live financial summary including total balance, "
                "monthly income, monthly expense, and net savings. "
                "Always call this first before giving financial advice."
            ),
            args_schema=EmptyInput,
        ),
        StructuredTool.from_function(
            coroutine=_get_budget_status,
            name="get_budget_status",
            description=(
                "Fetches the status of all active budgets for the user, including how much "
                "has been spent vs the limit for each category. Use this when the user asks "
                "about budgets or spending limits."
            ),
            args_schema=EmptyInput,
        ),
        StructuredTool.from_function(
            coroutine=_get_accounts,
            name="get_accounts",
            description=(
                "Fetches all user accounts (bank, cash, credit card, etc.) with their balances. "
                "Use when the user asks about their accounts or when you need to know which accounts exist."
            ),
            args_schema=EmptyInput,
        ),
        StructuredTool.from_function(
            coroutine=_create_budget,
            name="create_budget",
            description=(
                "Creates a new budget spending limit for a specific category. "
                "Use this ONLY when the user explicitly asks to 'set', 'create', or 'add' a budget. "
                "Example: 'Set a budget of 25000 for Food & Dining monthly.'"
            ),
            args_schema=CreateBudgetInput,
        ),
        StructuredTool.from_function(
            coroutine=_log_transaction,
            name="log_transaction",
            description=(
                "Logs a new income or expense transaction into the user's finance records. "
                "Use ONLY when the user explicitly asks to 'log', 'add', or 'record' a transaction or expense. "
                "Example: 'Log a 3500 expense for groceries under my cash account.'"
            ),
            args_schema=LogTransactionInput,
        ),
        StructuredTool.from_function(
            func=_analyze_purchase_scenario,
            name="analyze_purchase_scenario",
            description=(
                "Calculates the monthly EMI, total interest cost, and total payable amount for a purchase instalment plan. "
                "Use when the user asks 'can I afford', 'what if I buy', or asks about instalment/EMI scenarios. "
                "Returns raw numbers — you must then compare them to the user's financial summary to give a verdict."
            ),
            args_schema=AnalyzeScenarioInput,
        ),
    ]

    return tools
