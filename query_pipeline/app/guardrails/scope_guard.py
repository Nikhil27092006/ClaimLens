from query_pipeline.app.schemas.retrieval import RetrievalCandidate


def enforce_scope(candidates: list[RetrievalCandidate], workspace_id: str,
                  paper_ids: set[str]) -> list[RetrievalCandidate]:
    return [item for item in candidates
            if item.workspace_id == workspace_id and item.paper_id in paper_ids]
