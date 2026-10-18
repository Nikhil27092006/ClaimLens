from collections import defaultdict

from app.schemas.retrieval import RetrievalCandidate


def reciprocal_rank_fusion(
    result_sets: list[list[RetrievalCandidate]], k: int = 60
) -> list[RetrievalCandidate]:
    by_id: dict[str, RetrievalCandidate] = {}
    score_by_id: defaultdict[str, float] = defaultdict(float)
    for results in result_sets:
        for rank, candidate in enumerate(results, start=1):
            by_id.setdefault(candidate.chunk_id, candidate)
            score_by_id[candidate.chunk_id] += 1.0 / (k + rank)
    fused: list[RetrievalCandidate] = []
    for chunk_id, candidate in by_id.items():
        fused.append(candidate.model_copy(update={"fusion_score": score_by_id[chunk_id]}))
    return sorted(fused, key=lambda item: item.fusion_score or 0.0, reverse=True)