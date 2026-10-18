import pytest

from app.generation.parser import parse_generated_answer


def test_parser_accepts_json_fence() -> None:
    result = parse_generated_answer(
        '```json\n{"answer":"ok","claims":[],"uncertainties":[]}\n```'
    )
    assert result.answer == "ok"


def test_parser_rejects_invalid_json() -> None:
    with pytest.raises(ValueError, match="invalid JSON"):
        parse_generated_answer("not-json")