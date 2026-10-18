MARKERS = (
    "ignore previous instructions",
    "ignore all instructions",
    "reveal the system prompt",
    "act as an administrator",
)


def contains_instruction_injection(text: str) -> bool:
    return any(marker in text.lower() for marker in MARKERS)
