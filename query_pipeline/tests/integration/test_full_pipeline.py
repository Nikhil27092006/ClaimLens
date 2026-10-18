import pytest

from backend.app.config import Settings
from query_pipeline.app.pipeline.orchestrator import QueryOrchestrator
from query_pipeline.app.providers.fake_providers import (
    FakeDenseRetriever,
    FakeEmbeddingProvider,
    FakeGenerator,
    FakeReranker,
    FakeSparseRetriever,
)
from database.repositories.chunk_repository import InMemoryChunkRepository
from database.repositories.paper_repository import InMemoryPaperRepository
from query_pipeline.app.schemas.query import QueryRequest
from query_pipeline.app.schemas.retrieval import RetrievalCandidate


def make_candidate(chunk_id: str, paper_id: str, text: str, page: int):
    return RetrievalCandidate(
        chunk_id=chunk_id,
        workspace_id="workspace-1",
        paper_id=paper_id,
        paper_title=paper_id.title(),
        text=text,
        page_start=page,
        page_end=page,
        section="Results",
        dense_score=0.9,
        content_hash=chunk_id,
    )


@pytest.mark.asyncio
async def test_full_fake_rag_pipeline() -> None:
    candidates = [
        make_candidate("a", "paper-a", "Paper A achieved an F1-score of 0.91.", 7),
        make_candidate("b", "paper-b", "Paper B achieved an F1-score of 0.88.", 8),
    ]
    orchestrator = QueryOrchestrator(
        settings=Settings(min_relevance_score=0.0, top_k_reranked=2),
        embedding_provider=FakeEmbeddingProvider(),
        dense_retriever=FakeDenseRetriever(candidates),
        sparse_retriever=FakeSparseRetriever(candidates),
        reranker=FakeReranker(),
        generator=FakeGenerator(),
        paper_repository=InMemoryPaperRepository(
            {"workspace-1": {"paper-a", "paper-b"}}
        ),
        chunk_repository=InMemoryChunkRepository(
            {("workspace-1", "paper-a"), ("workspace-1", "paper-b")}
        ),
    )

    response = await orchestrator.run(
        "workspace-1",
        QueryRequest(
            question="Which paper achieved the highest F1-score?",
            paper_ids=["paper-a", "paper-b"],
        ),
    )

    assert response.pipeline_status == "completed"
    assert response.citations
    assert response.citations[0].source_id == "S1"
    assert response.claims[0].validation_status == "valid"
