import pytest

from app.providers.fake_providers import FakeDenseRetriever
from app.schemas.retrieval import RetrievalCandidate, RetrievalFilters


@pytest.mark.asyncio
async def test_dense_retriever_enforces_workspace_and_paper_scope() -> None:
    candidate = RetrievalCandidate(
        chunk_id="c1",
        workspace_id="w1",
        paper_id="p1",
        paper_title="P",
        text="Evidence",
        page_start=1,
        page_end=1,
    )
    result = await FakeDenseRetriever([candidate]).search(
        [0.1], "w2", ["p1"], RetrievalFilters(), 5
    )
    assert result == []