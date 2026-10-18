from app.schemas.retrieval import EvidenceSource, RetrievalCandidate


def assign_source_ids(
    candidates: list[RetrievalCandidate],
) -> list[EvidenceSource]:
    return [
        EvidenceSource(source_id=f"S{index}", candidate=candidate)
        for index, candidate in enumerate(candidates, start=1)
    ]