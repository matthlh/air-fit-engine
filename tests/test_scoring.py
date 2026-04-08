from app.scrape.signals import Signal
from app.scoring import ScoringResult, score_signals

RUBRIC = {
    "signal_weights": {
        "asset_management": 20,
        "brand_creative_ops": 20,
        "review_approvals": 15,
        "content_operations": 15,
        "versioning": 10,
        "scale_localization": 10,
        "creative_tooling": 10,
        "team_collaboration": 5,
    },
    "role_bonus_per_role": 5,
    "role_bonus_max": 15,
    "confidence_thresholds": {"high": 3, "medium": 1},
}


def _sig(category: str, source: str = "homepage") -> Signal:
    return Signal(
        category=category,
        label=category,
        matched_keyword="test",
        source=source,
        snippet="test snippet",
    )


def test_no_signals_scores_zero():
    result = score_signals([], [], rubric=RUBRIC)
    assert result.fit_score == 0
    assert result.confidence == "low"
    assert result.matched_categories == []


def test_single_signal_scores_correctly():
    result = score_signals([_sig("asset_management")], [], rubric=RUBRIC)
    assert result.fit_score == 20
    assert result.confidence == "medium"


def test_multiple_signals_sum():
    signals = [_sig("asset_management"), _sig("brand_creative_ops"), _sig("review_approvals")]
    result = score_signals(signals, [], rubric=RUBRIC)
    assert result.fit_score == 55
    assert result.confidence == "high"


def test_duplicate_category_counts_once():
    # Same category from homepage and careers — should not double-count
    signals = [_sig("asset_management", "homepage"), _sig("asset_management", "careers")]
    result = score_signals(signals, [], rubric=RUBRIC)
    assert result.fit_score == 20


def test_role_bonus_applied():
    signals = [_sig("asset_management")]
    result = score_signals(signals, ["creative director", "brand manager"], rubric=RUBRIC)
    assert result.role_bonus == 10
    assert result.fit_score == 30


def test_role_bonus_capped():
    signals = [_sig("asset_management")]
    roles = ["role1", "role2", "role3", "role4", "role5"]  # 5 × 5 = 25, capped at 15
    result = score_signals(signals, roles, rubric=RUBRIC)
    assert result.role_bonus == 15
    assert result.fit_score == 35


def test_score_capped_at_100():
    signals = [_sig(cat) for cat in RUBRIC["signal_weights"]]
    roles = ["r1", "r2", "r3"]
    result = score_signals(signals, roles, rubric=RUBRIC)
    assert result.fit_score == 100


def test_breakdown_keys_match_categories():
    signals = [_sig("asset_management"), _sig("versioning")]
    result = score_signals(signals, [], rubric=RUBRIC)
    assert set(result.breakdown.keys()) == {"asset_management", "versioning"}
    assert result.breakdown["asset_management"] == 20
    assert result.breakdown["versioning"] == 10
