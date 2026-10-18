from app.schemas.retrieval import RetrievalCandidate


def deduplicate(
    candidates: list[RetrievalCandidate],
) -> list[RetrievalCandidate]:
    result: list[RetrievalCandidate] = []
    seen_ids: set[str] = set()
    seen_hashes: set[str] = set()
    for candidate in candidates:
        if candidate.chunk_id in seen_ids:
            continue
        if candidate.content_hash and candidate.content_hash in seen_hashes:
            continue
        result.append(candidate)
        seen_ids.add(candidate.chunk_id)
        if candidate.content_hash:
            seen_hashes.add(candidate.content_hash)
    return result