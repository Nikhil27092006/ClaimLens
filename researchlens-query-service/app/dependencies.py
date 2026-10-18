from functools import lru_cache

from app.config import Settings, get_settings
from app.pipeline.orchestrator import QueryOrchestrator
from app.providers.fake_providers import (
    FakeDenseRetriever,
    FakeEmbeddingProvider,
    FakeGenerator,
)
from app.repositories.chunk_repository import InMemoryChunkRepository
from app.repositories.paper_repository import InMemoryPaperRepository
from app.schemas.retrieval import RetrievalCandidate


@lru_cache
def get_orchestrator() -> QueryOrchestrator:
    settings: Settings = get_settings()
    # Production wiring should replace these with ingestion-backed repositories
    # and Qdrant/embedding/generation adapters.
    candidates: list[RetrievalCandidate] = []
    return QueryOrchestrator(
        settings=settings,
        embedding_provider=FakeEmbeddingProvider(),
        dense_retriever=FakeDenseRetriever(candidates),
        generator=FakeGenerator(),
        paper_repository=InMemoryPaperRepository({}),
        chunk_repository=InMemoryChunkRepository(set()),
    )