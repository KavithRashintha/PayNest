import logging
from typing import Dict, Any, List, Optional
from app.core.config import settings
from app.services.finance_client import finance_client

logger = logging.getLogger(__name__)

# Try importing LangChain / Google GenAI / OpenAI models gracefully
try:
    from langchain_google_genai import ChatGoogleGenerativeAI
    HAS_LANGCHAIN_GEMINI = True
except ImportError:
    HAS_LANGCHAIN_GEMINI = False

try:
    from langchain_openai import ChatOpenAI
    HAS_LANGCHAIN_OPENAI = True
except ImportError:
    HAS_LANGCHAIN_OPENAI = False

SYSTEM_PROMPT = """You are PayNest AI, an empathetic, smart, and practical personal financial advisor for the PayNest financial management system.

Your mission is to provide accurate, concise, and actionable financial advice based on the user's real-time financial data.

Guidelines for interaction:
1. Always maintain a professional, encouraging, and helpful tone.
2. Reference currency values clearly (default currency is LKR unless specified otherwise).
3. Structure recommendations using clear bullet points or short paragraphs.
4. When budget warnings exist, highlight them constructively with practical savings steps.
5. Keep answers focused directly on the user's prompt and financial health.
"""

class AIAgentService:
    def __init__(self):
        self.llm = self._init_llm()

    def _init_llm(self):
        """Initializes available LLM provider based on environment configuration."""
        if settings.GEMINI_API_KEY and HAS_LANGCHAIN_GEMINI:
            try:
                logger.info("Initializing LangChain Google GenAI (Gemini) model")
                return ChatGoogleGenerativeAI(
                    model="gemini-1.5-flash",
                    google_api_key=settings.GEMINI_API_KEY,
                    temperature=0.7
                )
            except Exception as e:
                logger.warning(f"Could not initialize Gemini model: {e}")

        if settings.OPENAI_API_KEY and HAS_LANGCHAIN_OPENAI:
            try:
                logger.info("Initializing LangChain OpenAI model")
                return ChatOpenAI(
                    model="gpt-4o-mini",
                    api_key=settings.OPENAI_API_KEY,
                    temperature=0.7
                )
            except Exception as e:
                logger.warning(f"Could not initialize OpenAI model: {e}")

        logger.info("No LLM API keys configured. Operating with rules-based Intelligent Financial Engine fallback.")
        return None

    async def generate_chat_response(
        self, user_id: int, user_message: str, chat_history: Optional[List[Dict[str, str]]] = None
    ) -> str:
        """Generates conversational financial advisor response using LLM with live context."""
        # 1. Fetch live user financial context
        summary = await finance_client.fetch_financial_summary(user_id)
        budgets = await finance_client.fetch_budget_status(user_id)

        # 2. Build financial context string
        context_str = self._format_financial_context(summary, budgets)

        # 3. Use LLM if initialized
        if self.llm:
            try:
                prompt_messages = [
                    ("system", f"{SYSTEM_PROMPT}\n\n[USER FINANCIAL SNAPSHOT]\n{context_str}"),
                ]
                if chat_history:
                    for msg in chat_history:
                        role = "human" if msg.get("role") in ["user", "human"] else "ai"
                        prompt_messages.append((role, msg.get("content", "")))

                prompt_messages.append(("human", user_message))
                response = self.llm.invoke(prompt_messages)
                return response.content
            except Exception as e:
                logger.error(f"Error calling LLM provider: {e}")

        # Fallback response generator if LLM API key is not configured or fails
        return self._generate_fallback_chat_response(user_message, summary, budgets)

    async def generate_financial_insights(self, user_id: int) -> Dict[str, Any]:
        """Generates structured financial health analysis and budget insights."""
        summary = await finance_client.fetch_financial_summary(user_id)
        budgets = await finance_client.fetch_budget_status(user_id)

        total_balance = summary.get("totalBalance", 0.0)
        monthly_income = summary.get("monthlyIncome", 0.0)
        monthly_expense = summary.get("monthlyExpense", 0.0)
        net_savings = summary.get("netSavings", 0.0)

        insights = []
        savings_tips = []
        warnings = []

        if monthly_income > 0:
            savings_rate = (net_savings / monthly_income) * 100
            if savings_rate >= 20:
                insights.append(f"Great job! Your savings rate is {savings_rate:.1f}%, exceeding the 20% benchmark.")
            else:
                insights.append(f"Your current savings rate is {savings_rate:.1f}%. Aim to save at least 20% of monthly income.")
                savings_tips.append("Consider setting up automatic transfers to a dedicated savings account on payday.")
        else:
            insights.append("No income recorded for the current month yet.")

        # Check budgets
        for b_status in budgets:
            b_info = b_status.get("budget", {})
            cat_name = b_info.get("categoryName", "Category")
            pct = b_status.get("percentageUsed", 0.0)
            if b_status.get("isExceeded"):
                warnings.append(f"Alert: You have exceeded your budget limit for '{cat_name}' ({pct:.1f}% used).")
            elif pct >= 80:
                warnings.append(f"Warning: You have reached {pct:.1f}% of your budget for '{cat_name}'.")

        if monthly_expense > monthly_income and monthly_income > 0:
            warnings.append("Caution: Monthly expenses currently exceed monthly income!")
            savings_tips.append("Review non-essential expenses in Dining & Entertainment to lower monthly output.")

        overall_health = "HEALTHY" if not warnings and net_savings >= 0 else ("NEEDS_ATTENTION" if warnings else "BALANCED")

        return {
            "overallHealth": overall_health,
            "totalBalance": total_balance,
            "monthlyIncome": monthly_income,
            "monthlyExpense": monthly_expense,
            "netSavings": net_savings,
            "insights": insights,
            "savingsTips": savings_tips,
            "warnings": warnings
        }

    async def suggest_category(self, user_id: int, title: str, description: str = "") -> Dict[str, Any]:
        """Suggests category for transaction based on transaction title & description."""
        title_lower = (title + " " + (description or "")).lower()

        category_rules = [
            (["salary", "payroll", "stipend", "wages"], "Salary", "INCOME"),
            (["freelance", "upwork", "fiverr", "client"], "Freelance", "INCOME"),
            (["supermarket", "grocery", "keells", "cargills", "food", "kfc", "mcdonalds", "restaurant", "uber eats", "pickme food"], "Food & Dining", "EXPENSE"),
            (["fuel", "petrol", "uber", "pickme", "bus", "train", "transport"], "Transportation", "EXPENSE"),
            (["electricity", "water", "dialog", "mobitel", "wifi", "internet", "utility", "bill"], "Bills & Utilities", "EXPENSE"),
            (["rent", "apartment", "lease", "housing"], "Housing & Rent", "EXPENSE"),
            (["daraz", "amazon", "clothes", "fashion", "shopping"], "Shopping", "EXPENSE"),
            (["cinema", "netflix", "spotify", "movie", "game"], "Entertainment", "EXPENSE"),
            (["hospital", "doctor", "pharmacy", "medical", "fitness", "gym"], "Health & Fitness", "EXPENSE"),
        ]

        for keywords, cat_name, cat_type in category_rules:
            if any(kw in title_lower for kw in keywords):
                return {
                    "suggestedCategory": cat_name,
                    "categoryType": cat_type,
                    "confidence": 0.95
                }

        return {
            "suggestedCategory": "Other Expense",
            "categoryType": "EXPENSE",
            "confidence": 0.50
        }

    def _format_financial_context(self, summary: Dict[str, Any], budgets: List[Dict[str, Any]]) -> str:
        total_balance = summary.get("totalBalance", 0.0)
        monthly_income = summary.get("monthlyIncome", 0.0)
        monthly_expense = summary.get("monthlyExpense", 0.0)
        net_savings = summary.get("netSavings", 0.0)

        lines = [
            f"- Total Account Balance: LKR {total_balance:,.2f}",
            f"- Monthly Income: LKR {monthly_income:,.2f}",
            f"- Monthly Expense: LKR {monthly_expense:,.2f}",
            f"- Net Monthly Savings: LKR {net_savings:,.2f}",
        ]

        if budgets:
            lines.append("- Active Budget Statuses:")
            for b in budgets:
                b_info = b.get("budget", {})
                cat_name = b_info.get("categoryName", "Category")
                spent = b.get("spentAmount", 0.0)
                limit = b_info.get("amountLimit", 0.0)
                pct = b.get("percentageUsed", 0.0)
                lines.append(f"  * {cat_name}: Spent LKR {spent:,.2f} / LKR {limit:,.2f} ({pct:.1f}% used)")

        return "\n".join(lines)

    def _generate_fallback_chat_response(
        self, user_message: str, summary: Dict[str, Any], budgets: List[Dict[str, Any]]
    ) -> str:
        total_balance = summary.get("totalBalance", 0.0)
        monthly_income = summary.get("monthlyIncome", 0.0)
        monthly_expense = summary.get("monthlyExpense", 0.0)
        net_savings = summary.get("netSavings", 0.0)

        msg_lower = user_message.lower()

        if "balance" in msg_lower or "total" in msg_lower:
            return f"Your total account balance across all accounts is **LKR {total_balance:,.2f}**."
        elif "income" in msg_lower or "earnings" in msg_lower:
            return f"Your total income for this month is **LKR {monthly_income:,.2f}**."
        elif "expense" in msg_lower or "spending" in msg_lower or "spent" in msg_lower:
            return f"Your total expenses for this month are **LKR {monthly_expense:,.2f}**. Your net monthly savings stand at **LKR {net_savings:,.2f}**."
        elif "budget" in msg_lower:
            if not budgets:
                return "You currently have no active budgets set up. Creating budgets for high-frequency categories like Food & Shopping can help control monthly spending."
            budget_summary = "\n".join([
                f"- **{b.get('budget', {}).get('categoryName', 'Category')}**: LKR {b.get('spentAmount', 0.0):,.2f} of LKR {b.get('budget', {}).get('amountLimit', 0.0):,.2f} ({b.get('percentageUsed', 0.0):.1f}% used)"
                for b in budgets
            ])
            return f"Here is the status of your active budgets:\n\n{budget_summary}"
        else:
            return (
                f"Hello! As your PayNest AI advisor, here is a quick summary of your finances:\n\n"
                f"- **Total Balance**: LKR {total_balance:,.2f}\n"
                f"- **Monthly Income**: LKR {monthly_income:,.2f}\n"
                f"- **Monthly Expenses**: LKR {monthly_expense:,.2f}\n"
                f"- **Net Savings**: LKR {net_savings:,.2f}\n\n"
                f"How can I assist you with your budget or financial management today?"
            )

ai_agent_service = AIAgentService()
