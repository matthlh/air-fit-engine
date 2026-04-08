from pathlib import Path

import pandas as pd

from app.db import get_all_results


def export_csv(output_path: str | Path | None = None) -> Path:
    """Export all stored results to a flat CSV file."""
    results = get_all_results()
    rows = []
    for r in results:
        llm = r.get("llm_analysis") or {}
        rows.append({
            "domain": r.get("domain"),
            "homepage_url": r.get("homepage_url"),
            "careers_url": r.get("careers_url"),
            "title": r.get("title"),
            "fit_score": r.get("fit_score"),
            "confidence": r.get("confidence"),
            "signal_categories": ", ".join(r.get("signal_categories") or []),
            "creative_roles": ", ".join(r.get("creative_roles_detected") or []),
            "persona_guess": llm.get("persona_guess"),
            "fit_score_explanation": llm.get("fit_score_explanation"),
            "outreach_angle": llm.get("outreach_angle"),
            "created_at": r.get("created_at"),
        })

    out = Path(output_path or "data/output/results.csv")
    out.parent.mkdir(parents=True, exist_ok=True)
    pd.DataFrame(rows).to_csv(out, index=False)
    return out
