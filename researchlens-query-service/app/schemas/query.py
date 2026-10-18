from typing import Literal

from pydantic import BaseModel, Field

from app.schemas.citation import Citation, ClaimResponse
from app.schemas.retrieval import RetrievalFilters


class QueryRequest(BaseModel):
    question: str = Field(min_length=1, max_length=4000)
    paper_ids: list[str] = Field(min_length=1, max_length=20)
    conversation_id: str | None = None
    filters: RetrievalFilters = Field(default_factory=RetrievalFilters)


PipelineStatus = Literal[
    "completed",
    "insufficient_evidence",
    "no_ready_papers",
    "invalid_request",
    "generation_failed",
]


class QueryResponse(BaseModel):
    query_id: str
    answer: str
    claims: list[ClaimResponse] = Field(default_factory=list)
    citations: list[Citation] = Field(default_factory=list)
    uncertainties: list[str] = Field(default_factory=list)
    pipeline_status: PipelineStatus