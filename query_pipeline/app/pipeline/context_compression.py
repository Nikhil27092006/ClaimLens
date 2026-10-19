from query_pipeline.app.schemas.retrieval import EvidenceSource


def compress_context(
    evidence: list[EvidenceSource], max_characters: int
) -> list[EvidenceSource]:
    if max_characters < 1:
        raise ValueError("max_characters must be positive")
    selected: list[EvidenceSource] = []
    seen_text: set[str] = set()
    total = 0
    for source in evidence:
        if source.candidate.text in seen_text:
            continue
        size = max(1, len(source.candidate.text) // 4)
        if selected and total + size > max_characters:
            break
        selected.append(source)
        total += size
        seen_text.add(source.candidate.text)
    return selected