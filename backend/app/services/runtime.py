from typing import Any
from database.repositories.chunk_repository import InMemoryChunkRepository
from database.repositories.paper_repository import InMemoryPaperRepository

paper_repository = InMemoryPaperRepository({})
chunk_repository = InMemoryChunkRepository(set())
chunks_store: dict[str, dict[str, Any]] = {}


def publish_indexed_paper(workspace_id: str, paper_id: str) -> None:
    paper_repository.ready_by_workspace.setdefault(workspace_id, set()).add(paper_id)
    chunk_repository.indexed.add((workspace_id, paper_id))


def store_chunks(chunks: list[dict[str, Any]]) -> None:
    for c in chunks:
        chunks_store[c["chunk_id"]] = c

