from typing import Any, Optional
from pydantic import BaseModel


class SignalItem(BaseModel):
    category: str
    label: str
    matched_keyword: str
    source: str
    snippet: str


class PipelineResult(BaseModel):
    domain: str
    homepage_url: str
    careers_url: Optional[str] = None
    title: Optional[str] = None
    meta_description: Optional[str] = None
    fit_score: int
    confidence: str
    signal_categories: list[str]
    creative_roles_detected: list[str]
    score_breakdown: dict[str, int]
    signals: list[SignalItem]
    llm_analysis: Optional[dict[str, Any]] = None
    created_at: str


class CompanyResult(PipelineResult):
    """PipelineResult as returned from the database (includes row id)."""
    id: int


class AnalyzeRequest(BaseModel):
    domains: list[str]
