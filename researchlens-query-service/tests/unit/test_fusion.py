from app.pipeline.fusion import reciprocal_rank_fusion
from app.schemas.retrieval import RetrievalCandidate


def _candidate(chunk_id: str) -> RetrievalCandidate:
    return RetrievalCandidate(
        chunk_id=chunk_id,
        workspace_id="w",
        paper_id="p",
        paper_title="Paper",
        text=chunk_id,
        page_start=1,
        page_end=1,
    )


def test_reciprocal_rank_fusion_deduplicates_and_scores() -> None:
    result = reciprocal_rank_fusion(
        [[_candidate("a"), _candidate("b")], [_candidate("b"), _candidate("a")]]
    )
    assert {item.chunk_id for item in result} == {"a", "b"}
    assert result[0].fusion_score == result[1].fusion_score