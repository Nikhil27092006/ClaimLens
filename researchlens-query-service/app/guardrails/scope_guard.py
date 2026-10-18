from app.schemas.retrieval import RetrievalCandidate


def enforce_scope(
    candidates: list[RetrievalCandidate],
    workspace_id: str,
    paper_ids: set[str],
) -> list[RetrievalCandidate]:
    return [
        candidate
        for candidate in candidates
        if candidate.workspace_id == workspace_id and candidate.paper_id in paper_ids
    ]