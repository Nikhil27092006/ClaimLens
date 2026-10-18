from collections import defaultdict

from app.schemas.retrieval import RetrievalCandidate


def balance_evidence(
    candidates: list[RetrievalCandidate],
    paper_ids: list[str],
    per_paper_limit: int,
) -> list[RetrievalCandidate]:
    """Keep strong evidence from each selected paper without inventing coverage."""
    if len(paper_ids) < 2:
        return candidates
    grouped: defaultdict[str, list[RetrievalCandidate]] = defaultdict(list)
    for candidate in candidates:
        grouped[candidate.paper_id].append(candidate)
    result: list[RetrievalCandidate] = []
    for paper_id in paper_ids:
        result.extend(grouped[paper_id][:per_paper_limit])
    selected_ids = {candidate.chunk_id for candidate in result}
    result.extend(
        candidate for candidate in candidates if candidate.chunk_id not in selected_ids
    )
    return result
