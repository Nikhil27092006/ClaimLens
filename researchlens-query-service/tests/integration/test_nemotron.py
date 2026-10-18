import pytest

from app.providers.fake_providers import FakeGenerator
from app.schemas.retrieval import EvidenceSource, RetrievalCandidate


@pytest.mark.asyncio
async def test_fake_generator_returns_structured_claim() -> None:
    candidate = RetrievalCandidate(
        chunk_id="c1",
        workspace_id="w",
        paper_id="p",
        paper_title="P",
        text="Evidence",
        page_start=2,
        page_end=2,
    )
    result = await FakeGenerator().generate(
        "Question", [EvidenceSource(source_id="S1", candidate=candidate)]
    )
    assert result.claims[0].source_ids == ["S1"]