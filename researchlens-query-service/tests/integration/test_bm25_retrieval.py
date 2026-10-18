import pytest

from app.providers.bm25_provider import InMemoryBM25Retriever
from app.schemas.retrieval import RetrievalCandidate, RetrievalFilters


@pytest.mark.asyncio
async def test_bm25_retriever_matches_exact_terms() -> None:
    candidate = RetrievalCandidate(
        chunk_id="c1",
        workspace_id="w",
        paper_id="p",
        paper_title="P",
        text="F1-score is reported in Results",
        page_start=1,
        page_end=1,
    )
    result = await InMemoryBM25Retriever([candidate]).search(
        "F1-score", "w", ["p"], RetrievalFilters(), 5
    )
    assert result[0].chunk_id == "c1"