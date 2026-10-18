from app.schemas.retrieval import RetrievalCandidate


def deduplicate(
    candidates: list[RetrievalCandidate],
) -> list[RetrievalCandidate]:
    result: list[RetrievalCandidate] = []
    seen_ids: set[str] = set()
    seen_hashes: set[str] = set()
    by_id: dict[str, RetrievalCandidate] = {}
    for candidate in candidates:
        if candidate.chunk_id in seen_ids:
            existing = by_id[candidate.chunk_id]
            by_id[candidate.chunk_id] = existing.model_copy(
                update={
                    "dense_score": candidate.dense_score or existing.dense_score,
                    "sparse_score": candidate.sparse_score or existing.sparse_score,
                    "fusion_score": candidate.fusion_score or existing.fusion_score,
                    "rerank_score": candidate.rerank_score or existing.rerank_score,
                }
            )
            continue
        if candidate.content_hash and candidate.content_hash in seen_hashes:
            continue
        by_id[candidate.chunk_id] = candidate
        result.append(candidate)
        seen_ids.add(candidate.chunk_id)
        if candidate.content_hash:
            seen_hashes.add(candidate.content_hash)
    return result