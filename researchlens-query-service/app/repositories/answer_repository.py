from typing import Protocol

from app.schemas.query import QueryResponse


class AnswerRepository(Protocol):
    async def save(self, response: QueryResponse) -> None:
        ...


class InMemoryAnswerRepository:
    def __init__(self) -> None:
        self.responses: dict[str, QueryResponse] = {}

    async def save(self, response: QueryResponse) -> None:
        self.responses[response.query_id] = response