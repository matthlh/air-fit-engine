import json
from pathlib import Path

from app.llm.claude_client import call_claude
from app.schemas import FitAnalysis
from app.scrape.signals import Signal
from app.utils.logger import get_logger

logger = get_logger(__name__)

_PROMPTS = Path(__file__).parent.parent.parent / "prompts"
_SYSTEM = (_PROMPTS / "fit_analysis_system.md").read_text()
_USER_TEMPLATE = (_PROMPTS / "fit_analysis_user_template.md").read_text()


def _parse_response(raw: str, domain: str) -> dict:
    """Strip markdown fences if Claude wraps the JSON, then parse."""
    text = raw.strip()
    if text.startswith("```"):
        lines = text.splitlines()
        text = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])
    try:
        return json.loads(text)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Claude returned invalid JSON for {domain}: {exc}\nRaw: {raw[:200]}")


def analyze_fit(
    domain: str,
    title: str | None,
    meta_description: str | None,
    headings: list[str],
    visible_text: str,
    signals: list[Signal],
    fit_score: int,
    confidence: str,
) -> FitAnalysis:
    signal_lines = "\n".join(
        f"- [{s.label}] matched '{s.matched_keyword}' on {s.source}: {s.snippet[:120]}"
        for s in signals
    ) or "None detected"

    user_prompt = _USER_TEMPLATE.format(
        domain=domain,
        title=title or "N/A",
        meta_description=meta_description or "N/A",
        headings="\n".join(f"- {h}" for h in headings[:8]) or "N/A",
        visible_text=visible_text[:3000],
        signals=signal_lines,
        fit_score=fit_score,
        confidence=confidence,
    )

    raw = call_claude(_SYSTEM, user_prompt)
    logger.info(f"Claude raw response for {domain}: {raw[:120]}…")

    data = _parse_response(raw, domain)
    return FitAnalysis.model_validate(data)
