from dataclasses import dataclass

from database.repositories.chunk_repository import ChunkRepository
from database.repositories.paper_repository import PaperRepository
from query_pipeline.app.schemas.query import QueryRequest


@dataclass(frozen=True)
class ValidationResult:
    ready_paper_ids: set[str]
    status: str | None = None
    unavailable_paper_ids: set[str] = frozenset()


async def validate_query(
    request: QueryRequest,
    workspace_id: str,
    paper_repository: PaperRepository,
    chunk_repository: ChunkRepository,
) -> ValidationResult:
    if not request.question.strip():
        raise ValueError("Question must not be empty")
    if len(request.paper_ids) > 20:
        raise ValueError("Too many papers selected")
    ready = await paper_repository.ready_papers(workspace_id, request.paper_ids)
    if not ready:
        return ValidationResult(set(), "no_ready_papers", set(request.paper_ids))
    selected = set(request.paper_ids)
    if ready != selected:
        return ValidationResult(set(), "paper_not_ready", selected - ready)
    indexed = await chunk_repository.indexed_papers(workspace_id, list(ready))
    if indexed != ready:
        return ValidationResult(set(), "no_ready_papers", ready - indexed)
    return ValidationResult(ready)