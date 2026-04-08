from app.scrape.signals import (
    Signal,
    extract_signals,
    extract_role_signals,
    merge_signals,
)

HOMEPAGE_TEXT = """
We help creative teams manage their digital assets and streamline the approval process.
Our platform supports brand guidelines enforcement and content workflow automation.
"""

CAREERS_TEXT = """
We're hiring a Creative Director and a Creative Operations Manager.
Join our brand management team to drive content strategy at scale.
"""


def test_extract_signals_finds_categories():
    signals = extract_signals(HOMEPAGE_TEXT, source="homepage")
    categories = {s.category for s in signals}
    assert "asset_management" in categories
    assert "review_approvals" in categories
    assert "brand_creative_ops" in categories


def test_extract_signals_source_tag():
    signals = extract_signals(HOMEPAGE_TEXT, source="homepage")
    assert all(s.source == "homepage" for s in signals)


def test_extract_signals_one_per_category():
    signals = extract_signals(HOMEPAGE_TEXT, source="homepage")
    categories = [s.category for s in signals]
    assert len(categories) == len(set(categories)), "Duplicate categories returned"


def test_extract_signals_snippet_non_empty():
    signals = extract_signals(HOMEPAGE_TEXT, source="homepage")
    for s in signals:
        assert s.snippet, f"Empty snippet for {s.category}"


def test_extract_signals_no_match():
    signals = extract_signals("We sell widgets and sprockets.", source="homepage")
    assert signals == []


def test_extract_role_signals():
    roles = extract_role_signals(CAREERS_TEXT)
    assert "creative director" in roles
    assert "creative operations" in roles


def test_extract_role_signals_no_match():
    assert extract_role_signals("We are hiring an accountant.") == []


def test_merge_signals_combines_sources():
    hp = extract_signals(HOMEPAGE_TEXT, source="homepage")
    ca = extract_signals(CAREERS_TEXT, source="careers")
    merged = merge_signals(hp, ca)
    sources = {s.source for s in merged}
    assert "homepage" in sources
    assert "careers" in sources
    assert len(merged) == len(hp) + len(ca)
