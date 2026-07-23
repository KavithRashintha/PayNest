from typing import Optional
from fastapi import Header, HTTPException, status
from jose import jwt, JWTError
from pydantic import BaseModel
from app.core.config import settings

class CurrentUser(BaseModel):
    id: int
    email: str

def get_current_user(
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
    x_user_email: Optional[str] = Header(None, alias="X-User-Email"),
    authorization: Optional[str] = Header(None, alias="Authorization")
) -> CurrentUser:
    """
    FastAPI dependency that extracts authenticated user details from headers:
    1. Reads 'X-User-Id' and 'X-User-Email' headers forwarded by API Gateway.
    2. Fallback to validating direct 'Authorization: Bearer <token>' header if Gateway header is missing.
    3. Raises HTTP 401 Unauthorized if authentication fails.
    """
    if x_user_id:
        try:
            user_id = int(x_user_id)
            email = x_user_email if x_user_email else f"user_{user_id}@paynest.com"
            return CurrentUser(id=user_id, email=email)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid X-User-Id header format",
            )

    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        try:
            payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
            user_id_str = payload.get("sub")
            email = payload.get("email", f"user_{user_id_str}@paynest.com")
            if user_id_str is not None:
                return CurrentUser(id=int(user_id_str), email=email)
        except (JWTError, ValueError):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired JWT token",
            )

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="User authentication required (missing X-User-Id or Bearer token)",
    )
