from dataclasses import dataclass

from app.repositories.chunk_repository import ChunkRepository
from app.repositories.paper_repository import PaperRepository
from app.schemas.query import QueryRequest


@dataclass(frozen=True)
class ValidationResult:
    ready_paper_ids: set[str]
    status: str | None = None


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
        return ValidationResult(set(), "no_ready_papers")
    if not await chunk_repository.has_chunks(workspace_id, list(ready)):
        return ValidationResult(set(), "no_ready_papers")
    return ValidationResult(ready)