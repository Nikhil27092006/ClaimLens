from typing import Literal

from pydantic import BaseModel

from app.schemas.retrieval import RetrievalCandidate


CitationStatus = Literal["valid", "invalid", "unsupported", "needs_review"]


class Citation(BaseModel):
    source_id: str
    paper_id: str
    paper_title: str
    page_start: int
    page_end: int
    section: str | None = None
    snippet: str
    validation_status: CitationStatus


class ClaimResponse(BaseModel):
    text: str
    source_ids: list[str]
    citation_text: str
    validation_status: CitationStatus


def citation_from_candidate(
    source_id: str, candidate: RetrievalCandidate, status: CitationStatus
) -> Citation:
    return Citation(
        source_id=source_id,
        paper_id=candidate.paper_id,
        paper_title=candidate.paper_title,
        page_start=candidate.page_start,
        page_end=candidate.page_end,
        section=candidate.section,
        snippet=candidate.text,
        validation_status=status,
    )