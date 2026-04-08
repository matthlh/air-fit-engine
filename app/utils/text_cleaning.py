import re


def clean_text(text: str) -> str:
    """Collapse whitespace and strip leading/trailing space."""
    return re.sub(r"\s+", " ", text).strip()


def truncate(text: str, max_chars: int = 8_000) -> str:
    if len(text) <= max_chars:
        return text
    return text[:max_chars] + "…"
