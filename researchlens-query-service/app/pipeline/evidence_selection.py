from app.schemas.retrieval import EvidenceSource, RetrievalCandidate


def select_evidence(
    candidates: list[RetrievalCandidate], limit: int
) -> list[EvidenceSource]:
    return [
        EvidenceSource(source_id=f"S{index}", candidate=candidate)
        for index, candidate in enumerate(candidates[:limit], start=1)
    ]