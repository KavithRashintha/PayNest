import logging
from typing import Dict, Any, List, Optional
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)


class FinanceClient:
    def __init__(self, base_url: Optional[str] = None):
        self.base_url = base_url or settings.FINANCE_SERVICE_URL

    def _get_headers(self, user_id: int) -> Dict[str, str]:
        return {
            "X-User-Id": str(user_id),
            "Content-Type": "application/json"
        }

    # ─────────────────────────────────────────────
    # READ methods
    # ─────────────────────────────────────────────

    async def fetch_financial_summary(self, user_id: int) -> Dict[str, Any]:
        """
        Fetches overall financial analytics summary from finance-service:
        GET /api/finance/analytics/summary
        """
        url = f"{self.base_url}/api/finance/analytics/summary"
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.get(url, headers=self._get_headers(user_id))
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                logger.error(f"Error fetching financial summary for user {user_id}: {e}")
                return {}

    async def fetch_recent_transactions(self, user_id: int, page: int = 0, size: int = 20) -> Dict[str, Any]:
        """
        Fetches user transactions from finance-service:
        GET /api/finance/transactions?page={page}&size={size}
        """
        url = f"{self.base_url}/api/finance/transactions"
        params = {"page": page, "size": size}
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.get(url, headers=self._get_headers(user_id), params=params)
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                logger.error(f"Error fetching transactions for user {user_id}: {e}")
                return {}

    async def fetch_budget_status(self, user_id: int) -> List[Dict[str, Any]]:
        """
        Fetches active budgets status from finance-service:
        GET /api/finance/budgets/status
        """
        url = f"{self.base_url}/api/finance/budgets/status"
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.get(url, headers=self._get_headers(user_id))
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                logger.error(f"Error fetching budget status for user {user_id}: {e}")
                return []

    async def fetch_user_accounts(self, user_id: int) -> List[Dict[str, Any]]:
        """
        Fetches user accounts from finance-service:
        GET /api/finance/accounts
        """
        url = f"{self.base_url}/api/finance/accounts"
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.get(url, headers=self._get_headers(user_id))
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                logger.error(f"Error fetching user accounts for user {user_id}: {e}")
                return []

    async def fetch_categories(self, user_id: int) -> List[Dict[str, Any]]:
        """
        Fetches all available categories (system + user-defined) from finance-service:
        GET /api/finance/categories
        """
        url = f"{self.base_url}/api/finance/categories"
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.get(url, headers=self._get_headers(user_id))
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                logger.error(f"Error fetching categories for user {user_id}: {e}")
                return []

    # ─────────────────────────────────────────────
    # WRITE methods (Agentic Actions)
    # ─────────────────────────────────────────────

    async def create_budget(
        self,
        user_id: int,
        category_id: int,
        amount_limit: float,
        period: str = "MONTHLY"
    ) -> Dict[str, Any]:
        """
        Creates a new budget limit for a category in finance-service:
        POST /api/finance/budgets
        """
        from datetime import date, timedelta
        import calendar

        today = date.today()
        if period.upper() == "WEEKLY":
            start_date = today
            end_date = today + timedelta(days=6)
        elif period.upper() == "YEARLY":
            start_date = date(today.year, 1, 1)
            end_date = date(today.year, 12, 31)
        else:  # MONTHLY
            start_date = date(today.year, today.month, 1)
            _, last_day = calendar.monthrange(today.year, today.month)
            end_date = date(today.year, today.month, last_day)

        url = f"{self.base_url}/api/finance/budgets"
        payload = {
            "categoryId": category_id,
            "amountLimit": amount_limit,
            "period": period.upper(),
            "startDate": start_date.isoformat(),
            "endDate": end_date.isoformat()
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.post(url, headers=self._get_headers(user_id), json=payload)
                response.raise_for_status()
                return {"success": True, "data": response.json()}
            except httpx.HTTPStatusError as e:
                detail = e.response.text if e.response else str(e)
                logger.error(f"HTTP error creating budget for user {user_id}: {detail}")
                return {"success": False, "error": detail}
            except httpx.HTTPError as e:
                logger.error(f"Error creating budget for user {user_id}: {e}")
                return {"success": False, "error": str(e)}

    async def create_transaction(
        self,
        user_id: int,
        account_id: int,
        category_id: int,
        amount: float,
        transaction_type: str,
        description: str = "",
        title: str = ""
    ) -> Dict[str, Any]:
        """
        Logs a new transaction in finance-service:
        POST /api/finance/transactions
        """
        url = f"{self.base_url}/api/finance/transactions"
        payload = {
            "accountId": account_id,
            "categoryId": category_id,
            "amount": amount,
            "type": transaction_type.upper(),
            "description": description or title,
            "title": title or description,
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.post(url, headers=self._get_headers(user_id), json=payload)
                response.raise_for_status()
                return {"success": True, "data": response.json()}
            except httpx.HTTPStatusError as e:
                detail = e.response.text if e.response else str(e)
                logger.error(f"HTTP error creating transaction for user {user_id}: {detail}")
                return {"success": False, "error": detail}
            except httpx.HTTPError as e:
                logger.error(f"Error creating transaction for user {user_id}: {e}")
                return {"success": False, "error": str(e)}

    # ─────────────────────────────────────────────
    # Helper: Resolve category name → ID
    # ─────────────────────────────────────────────

    async def resolve_category_id(self, user_id: int, category_name: str) -> Optional[int]:
        """
        Resolves a human-readable category name to its integer ID.
        Case-insensitive partial match. Returns None if not found.
        """
        categories = await self.fetch_categories(user_id)
        name_lower = category_name.lower()

        # 1. Exact match first
        for cat in categories:
            if cat.get("name", "").lower() == name_lower:
                return cat.get("id")

        # 2. Partial / fuzzy match
        for cat in categories:
            if name_lower in cat.get("name", "").lower() or cat.get("name", "").lower() in name_lower:
                return cat.get("id")

        return None

    async def resolve_account_id(self, user_id: int, account_name: Optional[str] = None) -> Optional[int]:
        """
        Resolves an account name to its integer ID.
        If account_name is None, returns the first available account (default).
        """
        accounts = await self.fetch_user_accounts(user_id)
        if not accounts:
            return None

        if account_name:
            name_lower = account_name.lower()
            for acc in accounts:
                if name_lower in acc.get("name", "").lower() or name_lower in acc.get("accountType", "").lower():
                    return acc.get("id")

        # Default: first account
        return accounts[0].get("id")


finance_client = FinanceClient()
