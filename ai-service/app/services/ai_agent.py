"""
ai_agent.py
───────────
PayNest AI Agent Service — Agentic AI with tool-calling & rules-based fallback.

When an LLM API key is configured (Gemini or OpenAI):
  → Uses LangChain AgentExecutor with StructuredTools (ReAct / OpenAI-tools agent).
  → The LLM autonomously selects which tools to call, supplies arguments, and
    iterates until it has enough information to respond.

When no API key is configured OR the LLM call fails:
  → Falls back to a deterministic rules-based engine that:
      a) Detects action intents (create budget, log transaction) using regex.
      b) Executes the corresponding finance_client write method directly.
      c) Returns a structured response + list of actions taken.
"""

import logging
import re
import math
from typing import Dict, Any, List, Optional, Tuple
from app.core.config import settings
from app.services.finance_client import finance_client

logger = logging.getLogger(__name__)

# ── Optional LLM imports ───────────────────────────────────────────────────

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

# ── System prompt ──────────────────────────────────────────────────────────

AGENT_SYSTEM_PROMPT = """You are PayNest AI, a smart personal financial advisor AND autonomous financial assistant.

You have access to tools that let you:
  - Fetch the user's live financial data (balance, income, budgets, accounts)
  - Create budget limits on the user's behalf
  - Log income and expense transactions on the user's behalf
  - Perform EMI / instalment feasibility calculations

Behavioral rules:
1. For FINANCIAL ADVICE questions → fetch the financial summary first, then respond with analysis.
2. For SCENARIO / PURCHASE questions (e.g. "Can I afford a phone for 45K?") → call analyze_purchase_scenario + get_financial_summary, then give a verdict with EMI, total interest, and a clear FEASIBLE / RISKY / NOT RECOMMENDED verdict.
3. For ACTION COMMANDS (e.g. "Set a budget for food at 25000", "Log a 3500 grocery expense") → directly call the corresponding tool and confirm the action.
4. For FOLLOW-UP questions about a previous scenario, re-run analysis with updated parameters.
5. Always format currency as LKR. Use bold and bullet points for clarity.
6. After successfully executing an action (budget creation, transaction), confirm what was done and show any relevant updated balance/budget info.
7. Never fabricate data — always use tool results for real figures.
"""


class AIAgentService:
    def __init__(self):
        self.llm = self._init_llm()

    def _init_llm(self):
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

        logger.info("No LLM API keys configured. Using rules-based agentic fallback.")
        return None

    # ─────────────────────────────────────────────────────────────────────────
    # PUBLIC: Chat
    # ─────────────────────────────────────────────────────────────────────────

    async def generate_chat_response(
        self,
        user_id: int,
        user_message: str,
        chat_history: Optional[List[Dict[str, str]]] = None
    ) -> Tuple[str, List[str]]:
        """
        Returns (response_text, actions_taken).
        `actions_taken` is a list of human-readable strings describing any
        agentic actions the AI autonomously executed (e.g. "Created budget 'Food & Dining' LKR 25,000/month").
        """
        if self.llm:
            try:
                return await self._run_llm_agent(user_id, user_message, chat_history)
            except Exception as e:
                logger.error(f"LLM agent error: {e}")

        return await self._run_fallback_agent(user_id, user_message, chat_history)

    # ─────────────────────────────────────────────────────────────────────────
    # PUBLIC: Insights
    # ─────────────────────────────────────────────────────────────────────────

    async def generate_financial_insights(self, user_id: int) -> Dict[str, Any]:
        summary = await finance_client.fetch_financial_summary(user_id)
        budgets = await finance_client.fetch_budget_status(user_id)

        total_balance = summary.get("totalBalance", 0.0)
        monthly_income = summary.get("monthlyIncome", 0.0)
        monthly_expense = summary.get("monthlyExpense", 0.0)
        net_savings = summary.get("netSavings", 0.0)

        insights, savings_tips, warnings = [], [], []

        if monthly_income > 0:
            savings_rate = (net_savings / monthly_income) * 100
            if savings_rate >= 20:
                insights.append(f"Great job! Your savings rate is {savings_rate:.1f}%, exceeding the 20% benchmark.")
            else:
                insights.append(f"Your current savings rate is {savings_rate:.1f}%. Aim to save at least 20% of monthly income.")
                savings_tips.append("Consider setting up automatic transfers to a dedicated savings account on payday.")
        else:
            insights.append("No income recorded for the current month yet.")

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

        overall_health = "HEALTHY" if not warnings and net_savings >= 0 else "NEEDS_ATTENTION"

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

    # ─────────────────────────────────────────────────────────────────────────
    # PUBLIC: Categorize
    # ─────────────────────────────────────────────────────────────────────────

    async def suggest_category(self, user_id: int, title: str, description: str = "") -> Dict[str, Any]:
        title_lower = (title + " " + (description or "")).lower()
        category_rules = [
            (["salary", "payroll", "stipend", "wages"], "Salary", "INCOME"),
            (["freelance", "upwork", "fiverr", "client"], "Freelance", "INCOME"),
            (["supermarket", "grocery", "keells", "cargills", "food", "kfc", "mcdonalds", "restaurant", "uber eats", "pickme food"], "Food & Dining", "EXPENSE"),
            (["fuel", "petrol", "uber", "pickme", "bus", "train", "transport"], "Transportation", "EXPENSE"),
            (["electricity", "water", "dialog", "mobitel", "wifi", "internet", "utility", "bill"], "Bills & Utilities", "EXPENSE"),
            (["rent", "apartment", "lease", "housing"], "Housing & Rent", "EXPENSE"),
            (["daraz", "amazon", "clothes", "fashion", "shopping", "phone", "mobile", "laptop"], "Shopping", "EXPENSE"),
            (["cinema", "netflix", "spotify", "movie", "game"], "Entertainment", "EXPENSE"),
            (["hospital", "doctor", "pharmacy", "medical", "fitness", "gym"], "Health & Fitness", "EXPENSE"),
        ]
        for keywords, cat_name, cat_type in category_rules:
            if any(kw in title_lower for kw in keywords):
                return {"suggestedCategory": cat_name, "categoryType": cat_type, "confidence": 0.95}
        return {"suggestedCategory": "Other Expense", "categoryType": "EXPENSE", "confidence": 0.50}

    # ─────────────────────────────────────────────────────────────────────────
    # PRIVATE: LLM Agent (tool-calling with LangChain AgentExecutor)
    # ─────────────────────────────────────────────────────────────────────────

    async def _run_llm_agent(
        self,
        user_id: int,
        user_message: str,
        chat_history: Optional[List[Dict[str, str]]] = None
    ) -> Tuple[str, List[str]]:
        from app.services.agent_tools import build_agent_tools
        from langchain_core.messages import HumanMessage, AIMessage, SystemMessage

        tools = build_agent_tools(user_id)
        if not tools:
            raise RuntimeError("No tools available for agent")

        # Build LangChain agent with tool-calling
        llm_with_tools = self.llm.bind_tools(tools)

        # Build message history
        messages = [SystemMessage(content=AGENT_SYSTEM_PROMPT)]
        if chat_history:
            for msg in chat_history:
                role = msg.get("role", "user")
                content = msg.get("content", "")
                if role in ("user", "human"):
                    messages.append(HumanMessage(content=content))
                else:
                    messages.append(AIMessage(content=content))
        messages.append(HumanMessage(content=user_message))

        # Agentic loop — max 6 iterations to prevent runaway
        actions_taken: List[str] = []
        tool_map = {t.name: t for t in tools}

        for iteration in range(6):
            response = await llm_with_tools.ainvoke(messages)
            messages.append(response)

            if not response.tool_calls:
                # LLM produced a final text response — done
                return response.content, actions_taken

            # Process tool calls
            from langchain_core.messages import ToolMessage
            for tool_call in response.tool_calls:
                tool_name = tool_call["name"]
                tool_args = tool_call["args"]
                tool_id = tool_call["id"]

                logger.info(f"Agent calling tool '{tool_name}' with args: {tool_args}")

                tool = tool_map.get(tool_name)
                if tool is None:
                    tool_result = f"Tool '{tool_name}' not found."
                else:
                    try:
                        if tool.coroutine:
                            tool_result = await tool.acoroutine(**tool_args)
                        else:
                            tool_result = tool.func(**tool_args)
                    except Exception as e:
                        tool_result = f"Tool error: {str(e)}"
                        logger.error(f"Tool '{tool_name}' raised exception: {e}")

                # Track write actions for frontend badges
                if tool_name in ("create_budget", "log_transaction") and str(tool_result).startswith("✅"):
                    actions_taken.append(str(tool_result).replace("✅ ", ""))

                messages.append(ToolMessage(content=str(tool_result), tool_call_id=tool_id))

        # Exceeded max iterations — return what we have
        last_ai_msg = next(
            (m for m in reversed(messages) if isinstance(m, AIMessage) and m.content),
            None
        )
        return (
            last_ai_msg.content if last_ai_msg else "I'm having trouble completing this request. Please try again.",
            actions_taken
        )

    # ─────────────────────────────────────────────────────────────────────────
    # PRIVATE: Rules-based fallback agentic engine
    # ─────────────────────────────────────────────────────────────────────────

    async def _run_fallback_agent(
        self,
        user_id: int,
        user_message: str,
        chat_history: Optional[List[Dict[str, str]]] = None
    ) -> Tuple[str, List[str]]:
        """
        Deterministic rules engine — detects action intents and executes them,
        plus handles analysis and Q&A without an LLM.
        """
        actions_taken: List[str] = []
        msg_lower = user_message.lower()

        # ── 1. ACTION: Create Budget ────────────────────────────────────────
        budget_match = self._detect_create_budget_intent(user_message)
        if budget_match:
            cat_name, amount_limit, period = budget_match
            cat_id = await finance_client.resolve_category_id(user_id, cat_name)
            if cat_id:
                result = await finance_client.create_budget(user_id, cat_id, amount_limit, period)
                if result.get("success"):
                    action_str = f"Created budget '{cat_name}' — LKR {amount_limit:,.2f}/{period.lower().rstrip('ly')}ly"
                    actions_taken.append(action_str)
                    # Fetch updated budget status for confirmation
                    budgets = await finance_client.fetch_budget_status(user_id)
                    response = (
                        f"✅ Done! I've set a **{period.capitalize()}** budget of **LKR {amount_limit:,.2f}** "
                        f"for **{cat_name}**.\n\n"
                        f"You can track your spending against this limit in the Budgets section."
                    )
                    return response, actions_taken
                else:
                    return f"❌ Couldn't create the budget: {result.get('error', 'Unknown error')}. Please try from the Budgets page.", []
            else:
                return (
                    f"I couldn't find a category matching **'{cat_name}'**. "
                    f"Available examples: Food & Dining, Shopping, Transportation, Bills & Utilities, Entertainment, Health & Fitness.\n\n"
                    f"Try: *\"Set a monthly budget of LKR 25,000 for Food & Dining\"*"
                ), []

        # ── 2. ACTION: Log Transaction ──────────────────────────────────────
        tx_match = self._detect_log_transaction_intent(user_message)
        if tx_match:
            amount, tx_type, cat_name, description, account_name = tx_match
            cat_id = await finance_client.resolve_category_id(user_id, cat_name)
            acc_id = await finance_client.resolve_account_id(user_id, account_name)
            if cat_id and acc_id:
                result = await finance_client.create_transaction(
                    user_id=user_id,
                    account_id=acc_id,
                    category_id=cat_id,
                    amount=amount,
                    transaction_type=tx_type,
                    description=description,
                    title=description
                )
                if result.get("success"):
                    action_str = f"Logged {tx_type.lower()} of LKR {amount:,.2f} — '{description}' under '{cat_name}'"
                    actions_taken.append(action_str)
                    summary = await finance_client.fetch_financial_summary(user_id)
                    net = summary.get("netSavings", 0.0)
                    response = (
                        f"✅ Got it! Logged a **{tx_type.upper()}** of **LKR {amount:,.2f}** "
                        f"for **{description}** under **{cat_name}**.\n\n"
                        f"Your updated net monthly savings: **LKR {net:,.2f}**"
                    )
                    return response, actions_taken
                else:
                    return f"❌ Couldn't log the transaction: {result.get('error', 'Unknown error')}. Please try from the Transactions page.", []
            else:
                missing = []
                if not cat_id:
                    missing.append(f"category '{cat_name}'")
                if not acc_id:
                    missing.append("an account (please add one first)")
                return f"❌ Could not resolve {', '.join(missing)}. Please check and try again.", []

        # ── 3. ANALYSIS: Purchase Scenario / EMI ────────────────────────────
        scenario_response = self._analyze_purchase_scenario(user_message, {}, chat_history)
        if scenario_response != "SKIP":
            # Fetch real financial data for the scenario analysis
            summary = await finance_client.fetch_financial_summary(user_id)
            scenario_response = self._analyze_purchase_scenario_with_data(user_message, summary, chat_history)
            if scenario_response:
                return scenario_response, []

        # ── 4. Q&A: General financial questions ─────────────────────────────
        summary = await finance_client.fetch_financial_summary(user_id)
        budgets = await finance_client.fetch_budget_status(user_id)
        return self._generate_qa_response(user_message, summary, budgets), []

    # ─────────────────────────────────────────────────────────────────────────
    # PRIVATE: Intent detectors
    # ─────────────────────────────────────────────────────────────────────────

    def _detect_create_budget_intent(
        self, text: str
    ) -> Optional[Tuple[str, float, str]]:
        """
        Returns (category_name, amount_limit, period) or None.
        Patterns matched:
          - "set a budget of 25000 for food"
          - "create a monthly budget for shopping at 15000"
          - "add a 20000 budget for dining"
        """
        text_lower = text.lower()
        if not re.search(r'\b(set|create|add|make)\b.*?\bbudget\b', text_lower):
            return None

        # Extract amount
        amount = self._extract_single_amount(text)
        if not amount:
            return None

        # Extract period
        period = "MONTHLY"
        if "week" in text_lower:
            period = "WEEKLY"
        elif "year" in text_lower or "annual" in text_lower:
            period = "YEARLY"

        # Extract category — use original text (not lowercased) to preserve casing for title()
        # Pattern: "for <category>" where category ends at a number, period keyword, or end of string
        cat_match = re.search(
            r'\bfor\b\s+([a-zA-Z &/]+?)(?:\s+(?:at|of|monthly|weekly|yearly|limit)\b|\s*\d|\s*$)',
            text, re.IGNORECASE
        )
        if not cat_match:
            cat_match = re.search(
                r'\bon\b\s+([a-zA-Z &/]+?)(?:\s+(?:at|of|monthly|weekly|yearly|limit)\b|\s*\d|\s*$)',
                text, re.IGNORECASE
            )

        if cat_match:
            cat_raw = cat_match.group(1).strip().rstrip('.,;')
            # Remove only trailing period/budget keywords — preserve the actual category name
            cat_raw = re.sub(r'\b(monthly|weekly|yearly|budget|limit|spending)\b', '', cat_raw, flags=re.IGNORECASE).strip()
            cat_raw = re.sub(r'\s+', ' ', cat_raw).strip()
            if cat_raw and len(cat_raw) > 1:
                return cat_raw.title(), amount, period

        return None

    def _detect_log_transaction_intent(
        self, text: str
    ) -> Optional[Tuple[float, str, str, str, Optional[str]]]:
        """
        Returns (amount, type, category_name, description, account_name) or None.
        Patterns matched:
          - "log a 3500 expense for groceries"
          - "add an income of 50000 for salary"
          - "record a 1200 expense on food under cash"
        """
        text_lower = text.lower()
        trigger_words = [
            "log", "record", "add", "log an", "log a", "record a", "add a",
            "note", "track", "register"
        ]
        action_words = ["expense", "income", "transaction"]

        if not (any(t in text_lower for t in trigger_words) and any(a in text_lower for a in action_words)):
            return None

        # Determine type
        tx_type = "EXPENSE" if "expense" in text_lower else "INCOME"

        # Extract amount
        amount = self._extract_single_amount(text)
        if not amount:
            return None

        # Extract category (text after "for" / "on" / "under")
        cat_name = "Other Expense" if tx_type == "EXPENSE" else "Salary"
        cat_match = re.search(r'\bfor\b\s+([a-zA-Z &]+?)(?:\s+under|\s+in|\s+from|\s+to|$)', text_lower)
        if cat_match:
            raw = cat_match.group(1).strip()
            if raw and not raw[0].isdigit():
                cat_name = raw.title()

        # Extract account (after "under" / "from" / "in my")
        account_name = None
        acc_match = re.search(r'\b(?:under|from|in my|in)\b\s+([a-zA-Z ]+?)(?:\s+account|$)', text_lower)
        if acc_match:
            account_name = acc_match.group(1).strip().title()

        # Description: strip trigger words and reconstruct
        description = re.sub(
            r'\b(log|record|add|note|track|register|an?|expense|income|transaction|for|under|from|in my|in|account)\b',
            '', text_lower
        ).strip()
        description = re.sub(r'\s+', ' ', description).strip()
        if not description or description.replace(' ', '').isdigit():
            description = f"{cat_name} {tx_type.lower()}"

        return amount, tx_type, cat_name, description.title(), account_name

    def _extract_single_amount(self, text: str) -> Optional[float]:
        """Extracts the most likely monetary amount from text."""
        text_lower = text.lower()
        # K shorthand
        k_match = re.search(r'(\d+(?:\.\d+)?)\s*k\b', text_lower)
        if k_match:
            return float(k_match.group(1)) * 1000.0
        # Comma/decimal number >= 100
        amounts = re.findall(r'\b\d{1,3}(?:,\d{3})*(?:\.\d+)?\b|\b\d{3,9}\b', text)
        candidates = [float(a.replace(',', '')) for a in amounts if float(a.replace(',', '')) >= 100]
        return max(candidates) if candidates else None

    # ─────────────────────────────────────────────────────────────────────────
    # PRIVATE: Purchase scenario analysis
    # ─────────────────────────────────────────────────────────────────────────

    def _extract_scenario_params(self, text: str) -> Dict[str, Optional[float]]:
        text_lower = text.lower()
        params: Dict[str, Optional[float]] = {"amount": None, "months": None, "interest_rate": None}
        interest_match = re.search(r'(\d+(?:\.\d+)?)\s*%', text_lower)
        if interest_match:
            rate_val = float(interest_match.group(1))
            if any(kw in text_lower for kw in ["annual", "yearly", "per year", "p.a", "per annum"]):
                params["interest_rate"] = rate_val / 12.0
            else:
                params["interest_rate"] = rate_val
        months_match = re.search(r'(\d+)\s*(?:months?|mths?|mo\b)', text_lower)
        if months_match:
            params["months"] = float(months_match.group(1))
        else:
            years_match = re.search(r'(\d+)\s*(?:years?|yrs?)', text_lower)
            if years_match:
                params["months"] = float(years_match.group(1)) * 12.0
        k_match = re.search(r'(\d+(?:\.\d+)?)\s*k\b', text_lower)
        m_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:million|m\b)', text_lower)
        if m_match:
            params["amount"] = float(m_match.group(1)) * 1_000_000.0
        elif k_match:
            params["amount"] = float(k_match.group(1)) * 1000.0
        else:
            amounts = re.findall(r'\b\d{1,3}(?:,\d{3})*(?:\.\d+)?\b|\b\d{3,9}\b', text)
            candidates = [float(a.replace(',', '')) for a in amounts if float(a.replace(',', '')) >= 100]
            if candidates:
                params["amount"] = max(candidates)
        return params

    def _analyze_purchase_scenario(self, user_message: str, summary: Dict, chat_history: Optional[List]) -> str:
        """Lightweight pre-check — returns 'SKIP' if message is not scenario-related."""
        msg_lower = user_message.lower()
        # Primary triggers
        triggers = ["buy", "purchase", "installment", "instalment", "credit card", "afford", "what if", "emi", "worth", "can i", "hire purchase"]
        if any(t in msg_lower for t in triggers):
            return ""  # Signal to run with real data
        # Follow-up triggers: user changes a parameter on a previous scenario
        followup_triggers = ["instead", "how about", "what about", "change to", "make it", "try"]
        has_number = bool(re.search(r'\d', user_message))
        if any(t in msg_lower for t in followup_triggers) and (has_number or chat_history):
            return ""  # Signal to run with real data
        return "SKIP"

    def _analyze_purchase_scenario_with_data(
        self, user_message: str, summary: Dict, chat_history: Optional[List]
    ) -> Optional[str]:
        params = self._extract_scenario_params(user_message)

        # Follow-up: merge with previous scenario params if amount missing
        if not params.get("amount") and chat_history:
            for msg in reversed(chat_history):
                if msg.get("role") in ["user", "human"]:
                    prev = self._extract_scenario_params(msg.get("content", ""))
                    if prev.get("amount"):
                        params["amount"] = params.get("amount") or prev["amount"]
                        params["months"] = params.get("months") or prev.get("months")
                        params["interest_rate"] = params["interest_rate"] if params["interest_rate"] is not None else prev.get("interest_rate")
                        break

        if not params.get("amount"):
            return None

        amount = params["amount"]
        tenure = max(1, int(params.get("months") or 1))
        interest_rate = params.get("interest_rate")

        if interest_rate and interest_rate > 0:
            r = interest_rate / 100.0
            n = tenure
            emi = amount * r * math.pow(1 + r, n) / (math.pow(1 + r, n) - 1)
            total_payable = emi * n
            total_interest = total_payable - amount
        else:
            emi = amount / tenure
            total_payable = amount
            total_interest = 0.0

        total_balance = summary.get("totalBalance", 0.0)
        monthly_income = summary.get("monthlyIncome", 0.0)
        monthly_expense = summary.get("monthlyExpense", 0.0)
        current_net = summary.get("netSavings", 0.0)
        projected_net = current_net - emi

        if current_net > 0 and current_net >= emi * 1.2:
            verdict = "✅ FEASIBLE & SAFE"
            guidance = f"Your net savings (LKR {current_net:,.2f}/mo) comfortably cover the EMI, leaving LKR {projected_net:,.2f}/mo."
        elif current_net > 0 and current_net >= emi:
            verdict = "⚠️ FEASIBLE BUT TIGHT"
            guidance = f"You can afford it, but it will consume most of your savings. Consider extending the tenure to lower EMI."
        elif current_net > 0:
            verdict = "⚠️ MODERATE RISK / TIGHT CASHFLOW"
            guidance = f"EMI exceeds your net savings. Your monthly cashflow will go into deficit of LKR {abs(projected_net):,.2f}."
        else:
            verdict = "❌ HIGH RISK / NOT RECOMMENDED"
            guidance = f"Your net savings are already negative (LKR {current_net:,.2f}/mo). Adding this EMI will worsen the deficit."

        lines = [
            f"**📊 Purchase Impact Analysis**\n",
            f"**Purchase:** LKR {amount:,.2f} over {tenure} months",
        ]
        if interest_rate and interest_rate > 0:
            lines.append(f"**Monthly Interest:** {interest_rate:.2f}%")
            lines.append(f"**EMI:** LKR {emi:,.2f}/month")
            lines.append(f"**Total Interest:** LKR {total_interest:,.2f}")
            lines.append(f"**Total Payable:** LKR {total_payable:,.2f}")
        else:
            lines.append(f"**Monthly Payment:** LKR {emi:,.2f} (0% interest)")

        lines += [
            f"\n**📋 Your Finances:**",
            f"Balance: LKR {total_balance:,.2f} | Income: LKR {monthly_income:,.2f} | Expenses: LKR {monthly_expense:,.2f}",
            f"Net Savings: LKR {current_net:,.2f}/mo → After commitment: LKR {projected_net:,.2f}/mo",
            f"\n**{verdict}**",
            f"\n💡 {guidance}",
        ]
        if total_balance < amount:
            lines.append(f"\n⚠️ Note: The purchase price exceeds your total cash balance (LKR {total_balance:,.2f}).")

        return "\n".join(lines)

    # ─────────────────────────────────────────────────────────────────────────
    # PRIVATE: Q&A responses
    # ─────────────────────────────────────────────────────────────────────────

    def _generate_qa_response(
        self, user_message: str, summary: Dict, budgets: List
    ) -> str:
        msg_lower = user_message.lower()
        total_balance = summary.get("totalBalance", 0.0)
        monthly_income = summary.get("monthlyIncome", 0.0)
        monthly_expense = summary.get("monthlyExpense", 0.0)
        net_savings = summary.get("netSavings", 0.0)

        if "balance" in msg_lower or "how much do i have" in msg_lower:
            return f"Your total account balance is **LKR {total_balance:,.2f}**."

        if "income" in msg_lower or "earning" in msg_lower:
            return f"Your total income this month is **LKR {monthly_income:,.2f}**."

        if "expense" in msg_lower or "spending" in msg_lower or "spent" in msg_lower:
            return (
                f"Your total expenses this month are **LKR {monthly_expense:,.2f}**.\n"
                f"Net monthly savings: **LKR {net_savings:,.2f}**."
            )

        if "budget" in msg_lower:
            if not budgets:
                return (
                    "You have no active budgets yet. You can create one by saying:\n"
                    "**\"Set a monthly budget of LKR 25,000 for Food & Dining\"**"
                )
            lines = [f"  **{b.get('budget', {}).get('categoryName', 'Category')}**: "
                     f"LKR {b.get('spentAmount', 0.0):,.2f} / {b.get('budget', {}).get('amountLimit', 0.0):,.2f} "
                     f"({b.get('percentageUsed', 0.0):.1f}%)" for b in budgets]
            return "**Budget Status:**\n" + "\n".join(lines)

        if "save" in msg_lower or "tip" in msg_lower or "advice" in msg_lower:
            return (
                "**💡 Savings Tips:**\n"
                "- Use the **50/30/20 rule**: 50% needs, 30% wants, 20% savings.\n"
                "- Set **budget limits** for your top 3 expense categories.\n"
                "- Review subscriptions monthly and cancel unused ones.\n"
                "- Wait **24 hours** before any non-essential purchase.\n"
                "- Automate a savings transfer on payday."
            )

        if "health" in msg_lower or "how am i doing" in msg_lower:
            if monthly_income > 0:
                rate = (net_savings / monthly_income) * 100
                status = "✅ Great shape!" if rate >= 20 else "⚠️ Below the recommended 20% savings rate."
                return (
                    f"**📊 Financial Health:**\n"
                    f"- Balance: LKR {total_balance:,.2f}\n"
                    f"- Income: LKR {monthly_income:,.2f}\n"
                    f"- Expenses: LKR {monthly_expense:,.2f}\n"
                    f"- Net Savings: LKR {net_savings:,.2f} ({rate:.1f}%)\n\n"
                    f"{status}"
                )

        return (
            f"Hi! I'm your **PayNest AI Advisor**. Here's your quick summary:\n\n"
            f"- **Balance:** LKR {total_balance:,.2f}\n"
            f"- **Income:** LKR {monthly_income:,.2f}\n"
            f"- **Expenses:** LKR {monthly_expense:,.2f}\n"
            f"- **Net Savings:** LKR {net_savings:,.2f}\n\n"
            f"**Things you can ask me:**\n"
            f"- *\"Set a monthly budget of LKR 25,000 for Food & Dining\"*\n"
            f"- *\"Log a 3,500 expense for groceries\"*\n"
            f"- *\"What if I buy a phone for 45,000 on 12-month instalment at 2.5%?\"*\n"
            f"- *\"How am I doing financially?\"*"
        )

    # ─────────────────────────────────────────────────────────────────────────
    # Context helper
    # ─────────────────────────────────────────────────────────────────────────

    def _format_financial_context(self, summary: Dict, budgets: List) -> str:
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


ai_agent_service = AIAgentService()
