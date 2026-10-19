from query_pipeline.app.schemas.retrieval import RetrievalCandidate


def deduplicate(
    candidates: list[RetrievalCandidate],
) -> list[RetrievalCandidate]:
    result: list[RetrievalCandidate] = []
    seen_hashes: set[str] = set()
    by_id: dict[str, RetrievalCandidate] = {}
    for candidate in candidates:
        if candidate.chunk_id in by_id:
            existing = by_id[candidate.chunk_id]
            merged = existing.model_copy(
                update={
                    "dense_score": (
                        candidate.dense_score
                        if candidate.dense_score is not None
                        else existing.dense_score
                    ),
                    "sparse_score": (
                        candidate.sparse_score
                        if candidate.sparse_score is not None
                        else existing.sparse_score
                    ),
                    "fusion_score": (
                        candidate.fusion_score
                        if candidate.fusion_score is not None
                        else existing.fusion_score
                    ),
                    "rerank_score": (
                        candidate.rerank_score
                        if candidate.rerank_score is not None
                        else existing.rerank_score
                    ),
                }
            )
            by_id[candidate.chunk_id] = merged
            result[result.index(existing)] = merged
            continue
        if candidate.content_hash and candidate.content_hash in seen_hashes:
            continue
        by_id[candidate.chunk_id] = candidate
        result.append(candidate)
        if candidate.content_hash:
            seen_hashes.add(candidate.content_hash)
    return result