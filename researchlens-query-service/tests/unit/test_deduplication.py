from app.pipeline.deduplication import deduplicate
from app.schemas.retrieval import RetrievalCandidate


def test_deduplication_uses_chunk_id() -> None:
    candidate = RetrievalCandidate(
        chunk_id="c1",
        workspace_id="w",
        paper_id="p",
        paper_title="P",
        text="text",
        page_start=1,
        page_end=1,
    )
    assert len(deduplicate([candidate, candidate])) == 1