import json
import re

from pydantic import ValidationError

from app.schemas.generation import GeneratedAnswer


def parse_generated_answer(raw: str) -> GeneratedAnswer:
    text = raw.strip()
    fenced = re.fullmatch(r"```(?:json)?\s*(.*?)\s*```", text, re.DOTALL)
    if fenced:
        text = fenced.group(1)
    try:
        payload = json.loads(text)
    except json.JSONDecodeError as exc:
        raise ValueError("Generator returned invalid JSON") from exc
    try:
        return GeneratedAnswer.model_validate(payload)
    except ValidationError as exc:
        raise ValueError("Generator returned an invalid answer schema") from exc