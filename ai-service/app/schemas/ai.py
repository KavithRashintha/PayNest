from typing import List, Optional, Dict
from pydantic import BaseModel, Field

class ChatMessage(BaseModel):
    role: str = Field(..., description="Role of the message sender: 'user' or 'assistant'")
    content: str = Field(..., description="Message content")

class ChatRequest(BaseModel):
    message: str = Field(..., description="User's prompt message to AI advisor")
    history: Optional[List[ChatMessage]] = Field(default=None, description="Previous conversation history")

class ChatResponse(BaseModel):
    response: str = Field(..., description="AI advisor response text")

class CategorizeRequest(BaseModel):
    title: str = Field(..., description="Transaction title or merchant name")
    description: Optional[str] = Field(default=None, description="Optional transaction description")

class CategorizeResponse(BaseModel):
    suggestedCategory: str = Field(..., description="Suggested category name")
    categoryType: str = Field(..., description="INCOME or EXPENSE")
    confidence: float = Field(..., description="Confidence score of suggestion (0.0 to 1.0)")

class InsightsResponse(BaseModel):
    overallHealth: str = Field(..., description="HEALTHY, BALANCED, or NEEDS_ATTENTION")
    totalBalance: float = Field(..., description="Total balance across user accounts")
    monthlyIncome: float = Field(..., description="Total income for current month")
    monthlyExpense: float = Field(..., description="Total expense for current month")
    netSavings: float = Field(..., description="Net savings for current month")
    insights: List[str] = Field(..., description="List of general insights")
    savingsTips: List[str] = Field(..., description="Actionable savings recommendations")
    warnings: List[str] = Field(..., description="Budget warnings or over-spending alerts")
