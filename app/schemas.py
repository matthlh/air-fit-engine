from typing import Literal, Optional
from pydantic import BaseModel, Field


class FitAnalysis(BaseModel):
    fit_score_explanation: str = Field(..., min_length=10)
    pain_signals: list[str]
    persona_guess: str
    confidence: Literal["high", "medium", "low"]
    outreach_angle: Optional[str] = None
