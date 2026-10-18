import json
import re

from query_pipeline.app.schemas.generation import GeneratedAnswer


def parse_generated_answer(raw: str) -> GeneratedAnswer:
    text = raw.strip()
    fenced = re.fullmatch(r"```(?:json)?\s*(.*?)\s*```", text, re.DOTALL)
    if fenced:
        text = fenced.group(1)
    try:
        return GeneratedAnswer.model_validate(json.loads(text))
    except (json.JSONDecodeError, ValueError) as exc:
        raise ValueError("Generator returned invalid JSON or schema") from exc
