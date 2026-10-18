from typing import Protocol

from app.schemas.query import QueryResponse
from dataclasses import dataclass, field
from datetime import datetime, timezone


class AnswerRepository(Protocol):
    async def save(self, response: QueryResponse) -> None:
        ...


class InMemoryAnswerRepository:
    def __init__(self) -> None:
        self.responses: dict[str, QueryResponse] = {}

    async def save(self, response: QueryResponse) -> None:
        self.responses[response.query_id] = response


@dataclass(frozen=True)
class QueryRecord:
    query_id: str
    workspace_id: str
    original_question: str
    pipeline_status: str
    created_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    latency_ms: float | None = None


class InMemoryQueryRepository:
    def __init__(self) -> None:
        self.records: dict[str, QueryRecord] = {}

    async def save(self, record: QueryRecord) -> None:
        self.records[record.query_id] = record