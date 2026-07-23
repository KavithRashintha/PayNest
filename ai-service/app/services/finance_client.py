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

finance_client = FinanceClient()
