import pytest

from app.providers.reranker_provider import ScoreBasedReranker
from app.schemas.retrieval import RetrievalCandidate


@pytest.mark.asyncio
async def test_score_reranker_prioritizes_matching_text() -> None:
    candidates = [
        RetrievalCandidate(
            chunk_id="low",
            workspace_id="w",
            paper_id="p",
            paper_title="P",
            text="unrelated",
            page_start=1,
            page_end=1,
        ),
        RetrievalCandidate(
            chunk_id="high",
            workspace_id="w",
            paper_id="p",
            paper_title="P",
            text="dataset dataset",
            page_start=1,
            page_end=1,
        ),
    ]
    result = await ScoreBasedReranker().rerank("dataset", candidates, 2)
    assert result[0].chunk_id == "high"