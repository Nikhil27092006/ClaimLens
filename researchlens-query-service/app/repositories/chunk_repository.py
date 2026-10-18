from typing import Protocol


class ChunkRepository(Protocol):
    async def has_chunks(self, workspace_id: str, paper_ids: list[str]) -> bool:
        ...


class InMemoryChunkRepository:
    def __init__(self, ready_chunks: set[tuple[str, str]]) -> None:
        self.ready_chunks = ready_chunks

    async def has_chunks(self, workspace_id: str, paper_ids: list[str]) -> bool:
        return any((workspace_id, paper_id) in self.ready_chunks for paper_id in paper_ids)