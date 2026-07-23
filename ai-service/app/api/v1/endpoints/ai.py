from fastapi import APIRouter, Depends
from app.api.deps import get_current_user, CurrentUser
from app.schemas.ai import (
    ChatRequest,
    ChatResponse,
    CategorizeRequest,
    CategorizeResponse,
    InsightsResponse,
)
from app.services.ai_agent import ai_agent_service

router = APIRouter()

@router.post("/chat", response_model=ChatResponse, summary="Chat with AI Financial Advisor")
async def chat_with_advisor(
    request: ChatRequest,
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Accepts user prompt and message history, queries live user context from finance-service,
    and returns AI advisor response.
    """
    history_dicts = [h.model_dump() for h in request.history] if request.history else None
    response_text = await ai_agent_service.generate_chat_response(
        user_id=current_user.id,
        user_message=request.message,
        chat_history=history_dicts,
    )
    return ChatResponse(response=response_text)

@router.get("/insights", response_model=InsightsResponse, summary="Get AI Financial Insights")
async def get_financial_insights(
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Generates automated financial insights, savings tips, and budget alerts for the current user.
    """
    insights_data = await ai_agent_service.generate_financial_insights(user_id=current_user.id)
    return InsightsResponse(**insights_data)

@router.post("/categorize", response_model=CategorizeResponse, summary="Suggest Transaction Category")
async def suggest_category(
    request: CategorizeRequest,
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Suggests category & type for a transaction title and optional description.
    """
    suggestion = await ai_agent_service.suggest_category(
        user_id=current_user.id,
        title=request.title,
        description=request.description,
    )
    return CategorizeResponse(**suggestion)
