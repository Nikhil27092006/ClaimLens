from functools import lru_cache

from backend.app.config import Settings, get_settings
from query_pipeline.app.pipeline.orchestrator import QueryOrchestrator
from query_pipeline.app.providers.fake_providers import FakeDenseRetriever, FakeGenerator, FakeEmbeddingProvider
from query_pipeline.app.providers.embedding_provider import OpenAICompatibleEmbeddingProvider
from query_pipeline.app.providers.nemotron_provider import OpenAICompatibleGenerationProvider
from query_pipeline.app.providers.qdrant_provider import QdrantDenseRetriever
from query_pipeline.app.providers.bm25_provider import SQLiteBM25Retriever
from database.repositories.workspace_repository import InMemoryWorkspaceRepository
from backend.app.services.runtime import chunk_repository, paper_repository
from query_pipeline.app.schemas.retrieval import RetrievalCandidate


@lru_cache
def get_orchestrator() -> QueryOrchestrator:
    settings: Settings = get_settings()
    candidates: list[RetrievalCandidate] = []
    if not settings.use_fake_providers:
        from qdrant_client import QdrantClient

        if not settings.embedding_api_key or not settings.embedding_base_url:
            raise RuntimeError("Real embedding provider is not configured")
        if not settings.nvidia_api_key or not settings.nvidia_model:
            raise RuntimeError("Real generation provider is not configured")
        from pathlib import Path

        try:
            qdrant = QdrantClient(
                url=settings.qdrant_url,
                api_key=settings.qdrant_api_key or None,
                timeout=2.0,
            )
            qdrant.get_collections()
        except Exception:
            Path("storage/qdrant").mkdir(parents=True, exist_ok=True)
            qdrant = QdrantClient(path="storage/qdrant")

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
            sparse_retriever=SQLiteBM25Retriever(settings.bm25_index_path),
            generator=OpenAICompatibleGenerationProvider(
                settings.nvidia_base_url,
                settings.nvidia_api_key,
                settings.nvidia_model,
            ),
            paper_repository=paper_repository,
            chunk_repository=chunk_repository,
            workspace_repository=InMemoryWorkspaceRepository(set()),
        )
    return QueryOrchestrator(
        settings=settings,
        embedding_provider=FakeEmbeddingProvider(),
        dense_retriever=FakeDenseRetriever(candidates),
        generator=FakeGenerator(),
        paper_repository=paper_repository,
        chunk_repository=chunk_repository,
        workspace_repository=InMemoryWorkspaceRepository(set()),
    )
