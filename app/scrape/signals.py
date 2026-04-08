"""
Rule-based creative-ops signal extraction.

Scans page text for keyword phrases that indicate a company may have
creative-operations pain relevant to Air. Each matched category produces
one Signal per source (homepage / careers).
"""

from dataclasses import dataclass


@dataclass
class Signal:
    category: str       # machine key, e.g. "asset_management"
    label: str          # human label, e.g. "Asset Management / DAM"
    matched_keyword: str
    source: str         # "homepage" | "careers"
    snippet: str        # ~100 chars of context around the match


# category -> (human label, keyword phrases to scan for)
_SIGNAL_DEFINITIONS: dict[str, tuple[str, list[str]]] = {
    "review_approvals": (
        "Review & Approvals",
        [
            "approval process", "review process", "sign-off", "sign off",
            "proofing", "markup", "annotation", "feedback loop", "approval workflow",
        ],
    ),
    "asset_management": (
        "Asset Management / DAM",
        [
            "asset management", "digital asset", "dam", "media library",
            "asset library", "content library", "file management",
        ],
    ),
    "versioning": (
        "Versioning",
        [
            "version control", "versioning", "revision history",
            "file versions", "final_final", "v2 of",
        ],
    ),
    "brand_creative_ops": (
        "Brand & Creative Ops",
        [
            "brand ops", "creative ops", "creative operations", "brand operations",
            "brand management", "brand guidelines", "style guide",
            "brand consistency", "creative director", "creative team",
        ],
    ),
    "content_operations": (
        "Content Operations",
        [
            "content ops", "content operations", "content pipeline",
            "content workflow", "content calendar", "editorial calendar",
            "content strategy", "content production",
        ],
    ),
    "scale_localization": (
        "Scale & Localization",
        [
            "localization", "localise", "localize", "multi-market",
            "global campaign", "regional campaign", "translation",
            "campaign at scale", "international marketing",
        ],
    ),
    "creative_tooling": (
        "Creative Tooling",
        [
            "creative tools", "creative workflow", "creative software",
            "design tools", "creative suite", "content creation tool",
            "production tool",
        ],
    ),
    "team_collaboration": (
        "Cross-team Collaboration",
        [
            "cross-functional", "creative brief", "stakeholder review",
            "feedback from", "collaborate on creative", "alignment on",
        ],
    ),
}

# Job titles on the careers page that signal a creative-ops team
_CREATIVE_ROLES: list[str] = [
    "creative director",
    "creative operations",
    "creative ops",
    "creative manager",
    "creative producer",
    "brand manager",
    "content strategist",
    "content manager",
    "production manager",
    "traffic manager",
    "digital asset manager",
    "brand operations",
]


def _snippet(text: str, keyword: str, window: int = 100) -> str:
    idx = text.lower().find(keyword.lower())
    if idx == -1:
        return ""
    start = max(0, idx - window)
    end = min(len(text), idx + len(keyword) + window)
    chunk = text[start:end].strip()
    if start > 0:
        chunk = "…" + chunk
    if end < len(text):
        chunk = chunk + "…"
    return chunk


def extract_signals(text: str, source: str) -> list[Signal]:
    """
    Scan `text` for creative-ops signal keywords.
    Returns one Signal per matched category (first keyword match wins).
    """
    signals: list[Signal] = []
    text_lower = text.lower()

    for category, (label, keywords) in _SIGNAL_DEFINITIONS.items():
        for keyword in keywords:
            if keyword in text_lower:
                signals.append(
                    Signal(
                        category=category,
                        label=label,
                        matched_keyword=keyword,
                        source=source,
                        snippet=_snippet(text, keyword),
                    )
                )
                break  # one match per category per source

    return signals


def extract_role_signals(text: str) -> list[str]:
    """Return creative job titles found in text (intended for careers pages)."""
    text_lower = text.lower()
    return [role for role in _CREATIVE_ROLES if role in text_lower]


def merge_signals(
    homepage: list[Signal],
    careers: list[Signal],
) -> list[Signal]:
    """
    Combine homepage and careers signals.
    Keeps both if a category appears in both sources (different source tags).
    """
    return homepage + careers
