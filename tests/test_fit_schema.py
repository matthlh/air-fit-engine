import pytest
from pydantic import ValidationError
from app.schemas import FitAnalysis


VALID = {
    "fit_score_explanation": "Acme shows strong creative-ops signals including asset management and approval workflows.",
    "pain_signals": ["mentions approval process on homepage", "hiring a Creative Ops Manager"],
    "persona_guess": "Head of Creative Operations",
    "confidence": "high",
    "outreach_angle": "Your team manages assets across campaigns — Air can centralize that in one place.",
}


def test_valid_payload_parses():
    analysis = FitAnalysis.model_validate(VALID)
    assert analysis.fit_score_explanation.startswith("Acme")
    assert analysis.confidence == "high"
    assert analysis.persona_guess == "Head of Creative Operations"


def test_outreach_angle_optional():
    data = {**VALID, "outreach_angle": None}
    analysis = FitAnalysis.model_validate(data)
    assert analysis.outreach_angle is None


def test_outreach_angle_missing_defaults_none():
    data = {k: v for k, v in VALID.items() if k != "outreach_angle"}
    analysis = FitAnalysis.model_validate(data)
    assert analysis.outreach_angle is None


def test_invalid_confidence_rejected():
    with pytest.raises(ValidationError):
        FitAnalysis.model_validate({**VALID, "confidence": "very high"})


def test_explanation_too_short_rejected():
    with pytest.raises(ValidationError):
        FitAnalysis.model_validate({**VALID, "fit_score_explanation": "ok"})


def test_missing_required_field_rejected():
    data = {k: v for k, v in VALID.items() if k != "persona_guess"}
    with pytest.raises(ValidationError):
        FitAnalysis.model_validate(data)


def test_pain_signals_can_be_empty_list():
    analysis = FitAnalysis.model_validate({**VALID, "pain_signals": []})
    assert analysis.pain_signals == []
