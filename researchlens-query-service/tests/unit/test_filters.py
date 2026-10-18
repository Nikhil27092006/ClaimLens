from app.pipeline.filters import matches_filters
from app.schemas.retrieval import RetrievalCandidate, RetrievalFilters


def test_filters_page_range() -> None:
    candidate = RetrievalCandidate(
        chunk_id="c1",
        workspace_id="w",
        paper_id="p",
        paper_title="P",
        text="text",
        page_start=3,
        page_end=3,
    )
    assert matches_filters(candidate, RetrievalFilters(page_start=3))