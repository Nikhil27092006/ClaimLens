from app.pipeline.evidence_selection import select_evidence
from app.schemas.retrieval import RetrievalCandidate


def test_evidence_selection_assigns_controlled_ids() -> None:
    candidate = RetrievalCandidate(
        chunk_id="c1",
        workspace_id="w",
        paper_id="p",
        paper_title="P",
        text="text",
        page_start=1,
        page_end=1,
    )
    assert select_evidence([candidate], 1)[0].source_id == "S1"