from app.schemas.retrieval import EvidenceSource


def compress_context(
    evidence: list[EvidenceSource], max_characters: int
) -> list[EvidenceSource]:
    if max_characters < 1:
        raise ValueError("max_characters must be positive")
    selected: list[EvidenceSource] = []
    total = 0
    for source in evidence:
        size = len(source.candidate.text)
        if selected and total + size > max_characters:
            break
        selected.append(source)
        total += size
    return selected