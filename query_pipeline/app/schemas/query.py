from typing import Literal

from pydantic import BaseModel, Field, field_validator, model_validator

from query_pipeline.app.schemas.citation import Citation, ClaimResponse
from query_pipeline.app.schemas.retrieval import RetrievalFilters


class QueryRequest(BaseModel):
    question: str = Field(min_length=1, max_length=4000)
    paper_ids: list[str] = Field(min_length=1, max_length=20)
    conversation_id: str | None = None
    filters: RetrievalFilters = Field(default_factory=RetrievalFilters)

    @field_validator("question")
    @classmethod
    def normalize_question(cls, value: str) -> str:
        value = " ".join(value.split())
        if not value:
            raise ValueError("question must not be empty")
        return value

    @field_validator("paper_ids")
    @classmethod
    def validate_paper_ids(cls, value: list[str]) -> list[str]:
        if len(set(value)) != len(value):
            raise ValueError("paper_ids must not contain duplicates")
        if any(not paper_id.strip() for paper_id in value):
            raise ValueError("paper_ids must contain non-empty values")
        return value

    @model_validator(mode="after")
    def validate_conversation_id(self) -> "QueryRequest":
        if self.conversation_id is not None and not self.conversation_id.strip():
            raise ValueError("conversation_id must not be empty")
        return self


PipelineStatus = Literal[
    "completed",
    "insufficient_evidence",
    "no_ready_papers",
    "paper_not_ready",
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