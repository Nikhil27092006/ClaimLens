import pytest

from app.config import Settings
from app.pipeline.orchestrator import QueryOrchestrator
from app.providers.fake_providers import (
    FakeDenseRetriever,
    FakeEmbeddingProvider,
    FakeGenerator,
)
from app.repositories.chunk_repository import InMemoryChunkRepository
from app.repositories.paper_repository import InMemoryPaperRepository
from app.schemas.query import QueryRequest
from app.schemas.retrieval import RetrievalCandidate


@pytest.mark.asyncio
async def test_fake_provider_pipeline_returns_citations() -> None:
    candidate = RetrievalCandidate(
        chunk_id="chunk-1",
        workspace_id="workspace-1",
        paper_id="paper-1",
        paper_title="Paper A",
        text="The proposed model achieved an F1-score of 0.91.",
        page_start=7,
        page_end=7,
        section="Results",
        content_hash="hash-1",
    )
    orchestrator = QueryOrchestrator(
        settings=Settings(top_k_reranked=1),
        embedding_provider=FakeEmbeddingProvider(),
        dense_retriever=FakeDenseRetriever([candidate]),
        generator=FakeGenerator(),
        paper_repository=InMemoryPaperRepository(
            {"workspace-1": {"paper-1"}}
        ),
        chunk_repository=InMemoryChunkRepository(
            {("workspace-1", "paper-1")}
        ),
    )

    response = await orchestrator.run(
        "workspace-1",
        QueryRequest(
            question="What was the F1-score?",
            paper_ids=["paper-1"],
        ),
    )

    assert response.pipeline_status == "completed"
    assert response.citations[0].source_id == "S1"
    assert response.citations[0].page_start == 7
    assert response.claims[0].validation_status == "valid"


@pytest.mark.asyncio
async def test_fake_provider_pipeline_refuses_without_ready_papers() -> None:
    orchestrator = QueryOrchestrator(
        settings=Settings(),
        embedding_provider=FakeEmbeddingProvider(),
        dense_retriever=FakeDenseRetriever([]),
        generator=FakeGenerator(),
        paper_repository=InMemoryPaperRepository({}),
        chunk_repository=InMemoryChunkRepository(set()),
    )

    response = await orchestrator.run(
        "workspace-1",
        QueryRequest(question="What is this about?", paper_ids=["paper-1"]),
    )

    assert response.pipeline_status == "no_ready_papers"
    assert response.citations == []