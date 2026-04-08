"""
Core pipeline: domain → structured result dict.

This is the single source of truth for the end-to-end flow.
run_batch.py and the API both call run_pipeline().
"""

from dataclasses import asdict
from datetime import datetime, timezone
from typing import Optional

from app.config import ANTHROPIC_API_KEY
from app.scrape.browser import fetch_page
from app.scrape.careers import find_careers_url
from app.scrape.extractors import extract_page_content
from app.scrape.signals import extract_signals, extract_role_signals, merge_signals
from app.scoring import score_signals
from app.utils.logger import get_logger
from app.utils.url_helpers import get_base_domain, normalize_url

logger = get_logger(__name__)


async def run_pipeline(domain: str) -> dict:
    """
    Scrape a domain, extract signals, score fit, optionally call Claude.
    Returns a dict ready for storage or API response.
    Claude analysis is skipped if ANTHROPIC_API_KEY is not configured.
    """
    url = normalize_url(domain)
    base_domain = get_base_domain(url)

    logger.info(f"Fetching homepage: {url}")
    html = await fetch_page(url)
    homepage = extract_page_content(html, url)
    homepage_signals = extract_signals(homepage.visible_text, source="homepage")

    careers_url: Optional[str] = find_careers_url(homepage.links, base_domain)
    careers_signals = []
    role_signals: list[str] = []

    if careers_url:
        try:
            logger.info(f"Fetching careers page: {careers_url}")
            careers_html = await fetch_page(careers_url)
            careers = extract_page_content(careers_html, careers_url)
            careers_signals = extract_signals(careers.visible_text, source="careers")
            role_signals = extract_role_signals(careers.visible_text)
        except Exception as exc:
            logger.warning(f"Careers page unavailable ({careers_url}): {exc}")
            careers_url = None

    all_signals = merge_signals(homepage_signals, careers_signals)
    scoring = score_signals(all_signals, role_signals)

    llm_analysis = None
    if ANTHROPIC_API_KEY:
        try:
            from app.llm.fit_analysis import analyze_fit
            analysis = analyze_fit(
                domain=domain,
                title=homepage.title,
                meta_description=homepage.meta_description,
                headings=homepage.headings,
                visible_text=homepage.visible_text,
                signals=all_signals,
                fit_score=scoring.fit_score,
                confidence=scoring.confidence,
            )
            llm_analysis = analysis.model_dump()
        except Exception as exc:
            logger.warning(f"Claude analysis skipped for {domain}: {exc}")

    return {
        "domain": domain,
        "homepage_url": url,
        "careers_url": careers_url,
        "title": homepage.title,
        "meta_description": homepage.meta_description,
        "fit_score": scoring.fit_score,
        "confidence": scoring.confidence,
        "signal_categories": scoring.matched_categories,
        "creative_roles_detected": role_signals,
        "score_breakdown": scoring.breakdown,
        "signals": [asdict(s) for s in all_signals],
        "llm_analysis": llm_analysis,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
