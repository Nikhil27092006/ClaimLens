from typing import Protocol


class ChunkRepository(Protocol):
    async def has_chunks(self, workspace_id: str, paper_ids: list[str]) -> bool:
        ...

    async def indexed_papers(self, workspace_id: str, paper_ids: list[str]) -> set[str]:
        ...


class InMemoryChunkRepository:
    def __init__(self, indexed: set[tuple[str, str]]) -> None:
        self.indexed = indexed

    async def has_chunks(self, workspace_id, paper_ids):
        return any((workspace_id, paper_id) in self.indexed for paper_id in paper_ids)

    async def indexed_papers(self, workspace_id, paper_ids):
        return {
            paper_id for paper_id in paper_ids
            if (workspace_id, paper_id) in self.indexed
        }
