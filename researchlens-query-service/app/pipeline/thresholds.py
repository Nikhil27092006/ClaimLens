from app.schemas.retrieval import RetrievalCandidate


def above_relevance_threshold(
    candidates: list[RetrievalCandidate], threshold: float
) -> list[RetrievalCandidate]:
    return [
        candidate
        for candidate in candidates
        if _score(candidate) is not None and _score(candidate) >= threshold
    ]


def _score(candidate: RetrievalCandidate) -> float | None:
    for value in (
        candidate.rerank_score,
        candidate.fusion_score,
        candidate.dense_score,
        candidate.sparse_score,
    ):
        if value is not None:
            return value
    return None