from functools import lru_cache

from backend.app.config import Settings, get_settings
from query_pipeline.app.pipeline.orchestrator import QueryOrchestrator
from query_pipeline.app.providers.fake_providers import FakeDenseRetriever, FakeGenerator, FakeEmbeddingProvider
from query_pipeline.app.providers.embedding_provider import OpenAICompatibleEmbeddingProvider
from query_pipeline.app.providers.nemotron_provider import OpenAICompatibleGenerationProvider
from query_pipeline.app.providers.qdrant_provider import QdrantDenseRetriever
from database.repositories.chunk_repository import InMemoryChunkRepository
from database.repositories.paper_repository import InMemoryPaperRepository
from database.repositories.workspace_repository import InMemoryWorkspaceRepository
from query_pipeline.app.schemas.retrieval import RetrievalCandidate


@lru_cache
def get_orchestrator() -> QueryOrchestrator:
    settings: Settings = get_settings()
    candidates: list[RetrievalCandidate] = []
    if not settings.use_fake_providers:
        from qdrant_client import QdrantClient

        if not settings.embedding_api_key or not settings.embedding_base_url:
            raise RuntimeError("Real embedding provider is not configured")
        if not settings.nebius_api_key or not settings.nebius_model:
            raise RuntimeError("Real generation provider is not configured")
        qdrant = QdrantClient(
            url=settings.qdrant_url,
            api_key=settings.qdrant_api_key or None,
        )
        return QueryOrchestrator(
            settings=settings,
            embedding_provider=OpenAICompatibleEmbeddingProvider(
                settings.embedding_base_url,
                settings.embedding_api_key,
                settings.embedding_model or "",
            ),
            dense_retriever=QdrantDenseRetriever(
                qdrant, settings.qdrant_collection
            ),
            generator=OpenAICompatibleGenerationProvider(
                settings.nebius_base_url,
                settings.nebius_api_key,
                settings.nebius_model,
            ),
            paper_repository=InMemoryPaperRepository({}),
            chunk_repository=InMemoryChunkRepository(set()),
            workspace_repository=InMemoryWorkspaceRepository(set()),
        )
    return QueryOrchestrator(
        settings=settings,
        embedding_provider=FakeEmbeddingProvider(),
        dense_retriever=FakeDenseRetriever(candidates),
        generator=FakeGenerator(),
        paper_repository=InMemoryPaperRepository({}),
        chunk_repository=InMemoryChunkRepository(set()),
        workspace_repository=InMemoryWorkspaceRepository(set()),
    )
