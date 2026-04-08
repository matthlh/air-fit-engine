"""
Rule-based fit scorer.

Code owns the score. Claude explains it (Step 5).

Loads scoring_rubric.json at import time so the rubric is editable
without touching Python code.
"""

import json
from dataclasses import dataclass, field
from pathlib import Path

from app.scrape.signals import Signal

_RUBRIC_PATH = Path(__file__).parent.parent / "data" / "scoring_rubric.json"

with _RUBRIC_PATH.open() as _f:
    _RUBRIC: dict = json.load(_f)


@dataclass
class ScoringResult:
    fit_score: int                    # 0–100
    confidence: str                   # "high" | "medium" | "low"
    matched_categories: list[str]     # deduplicated signal categories that scored
    role_bonus: int                   # points added from creative role detection
    breakdown: dict[str, int] = field(default_factory=dict)  # category -> points


def score_signals(
    signals: list[Signal],
    role_signals: list[str],
    rubric: dict | None = None,
) -> ScoringResult:
    """
    Convert extracted signals and detected roles into a numeric fit score.

    A category is only counted once even if it appeared on both homepage
    and careers page.
    """
    r = rubric or _RUBRIC

    # Deduplicate: a category that hit on both sources counts once
    hit_categories = {s.category for s in signals}

    weights: dict[str, int] = r["signal_weights"]
    breakdown = {cat: weights[cat] for cat in hit_categories if cat in weights}
    base_score = sum(breakdown.values())

    role_bonus = min(
        len(role_signals) * r["role_bonus_per_role"],
        r["role_bonus_max"],
    )

    fit_score = min(base_score + role_bonus, 100)

    thresholds = r["confidence_thresholds"]
    if len(hit_categories) >= thresholds["high"]:
        confidence = "high"
    elif len(hit_categories) >= thresholds["medium"]:
        confidence = "medium"
    else:
        confidence = "low"

    return ScoringResult(
        fit_score=fit_score,
        confidence=confidence,
        matched_categories=sorted(hit_categories),
        role_bonus=role_bonus,
        breakdown=breakdown,
    )
