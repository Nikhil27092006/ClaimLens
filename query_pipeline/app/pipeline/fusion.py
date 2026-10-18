from collections import defaultdict

from query_pipeline.app.schemas.retrieval import RetrievalCandidate


def reciprocal_rank_fusion(result_sets: list[list[RetrievalCandidate]], k: int = 60):
    by_id: dict[str, RetrievalCandidate] = {}
    scores: defaultdict[str, float] = defaultdict(float)
    for result_set in result_sets:
        for rank, candidate in enumerate(result_set, 1):
            by_id.setdefault(candidate.chunk_id, candidate)
            scores[candidate.chunk_id] += 1 / (k + rank)
    return sorted(
        [item.model_copy(update={"fusion_score": scores[item.chunk_id]})
         for item in by_id.values()],
        key=lambda item: item.fusion_score or 0,
        reverse=True,
    )
