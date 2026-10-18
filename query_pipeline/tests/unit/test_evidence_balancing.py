from query_pipeline.app.pipeline.evidence_balancing import balance_evidence
from query_pipeline.app.schemas.retrieval import RetrievalCandidate


def candidate(chunk_id: str, paper_id: str) -> RetrievalCandidate:
    return RetrievalCandidate(
        chunk_id=chunk_id,
        workspace_id="w",
        paper_id=paper_id,
        paper_title=paper_id,
        text=chunk_id,
        page_start=1,
        page_end=1,
    )


def test_balancing_keeps_evidence_from_each_paper() -> None:
    result = balance_evidence(
        [candidate("a1", "a"), candidate("a2", "a"), candidate("b1", "b")],
        ["a", "b"],
        1,
    )
    assert [item.paper_id for item in result[:2]] == ["a", "b"]
