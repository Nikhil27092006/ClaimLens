from app.pipeline.context_compression import compress_context
from app.schemas.retrieval import EvidenceSource, RetrievalCandidate


def test_compression_respects_character_budget() -> None:
    candidate = RetrievalCandidate(
        chunk_id="c1",
        workspace_id="w",
        paper_id="p",
        paper_title="P",
        text="12345",
        page_start=1,
        page_end=1,
    )
    assert len(compress_context([EvidenceSource(source_id="S1", candidate=candidate)], 5)) == 1