INJECTION_MARKERS = (
    "ignore previous instructions",
    "ignore all instructions",
    "system message",
    "developer message",
)


def contains_instruction_injection(text: str) -> bool:
    lowered = text.lower()
    return any(marker in lowered for marker in INJECTION_MARKERS)