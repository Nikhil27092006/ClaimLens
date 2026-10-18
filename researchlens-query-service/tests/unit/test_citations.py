from app.citations.renderer import render_citation
from app.schemas.citation import Citation


def test_render_citation() -> None:
    citation = Citation(
        source_id="S1",
        paper_id="p1",
        paper_title="Paper A",
        page_start=7,
        page_end=8,
        snippet="evidence",
        validation_status="valid",
    )
    assert render_citation(citation) == "[Paper A, p. 7-8]"