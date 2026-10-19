import pytest

from query_pipeline.app.pipeline.classification import classify_question
from query_pipeline.app.pipeline.decomposition import decompose_query
from query_pipeline.app.pipeline.fusion import reciprocal_rank_fusion
from query_pipeline.app.pipeline.rewriting import rewrite_query
from query_pipeline.app.schemas.retrieval import RetrievalCandidate


def candidate(chunk_id: str) -> RetrievalCandidate:
    return RetrievalCandidate(
        chunk_id=chunk_id,
        workspace_id="w",
        paper_id="p",
        paper_title="Paper",
        text=f"evidence {chunk_id}",
        page_start=1,
        page_end=1,
        dense_score=0.9,
    )


def test_classification_and_decomposition() -> None:
    assert classify_question("Compare the results", 2) == "multi_paper_comparison"
    assert decompose_query("first?second?third", 2) == ["first", "second"]
    assert rewrite_query("What about it?", "Paper A").endswith("Paper A")


def test_fusion_merges_ranked_results() -> None:
    result = reciprocal_rank_fusion([[candidate("a")], [candidate("a"), candidate("b")]])
    assert [item.chunk_id for item in result] == ["a", "b"]


@pytest.mark.parametrize("question", ["", "   "])
def test_empty_queries_are_rejected_by_request_schema(question: str) -> None:
    from pydantic import ValidationError
    from query_pipeline.app.schemas.query import QueryRequest

    with pytest.raises(ValidationError):
        QueryRequest(question=question, paper_ids=["p"])
