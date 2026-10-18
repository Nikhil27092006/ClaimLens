import pytest

from app.pipeline.validation import validate_query
from app.repositories.chunk_repository import InMemoryChunkRepository
from app.repositories.paper_repository import InMemoryPaperRepository
from app.schemas.query import QueryRequest


@pytest.mark.asyncio
async def test_validation_reports_no_ready_papers() -> None:
    result = await validate_query(
        QueryRequest(question="Question", paper_ids=["p1"]),
        "w1",
        InMemoryPaperRepository({}),
        InMemoryChunkRepository(set()),
    )
    assert result.status == "no_ready_papers"