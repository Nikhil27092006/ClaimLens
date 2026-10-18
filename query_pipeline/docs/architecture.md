# Architecture

FastAPI routes depend on `QueryOrchestrator`. Providers and repositories are
protocols, so fake implementations can prove the RAG behavior before ingestion,
Qdrant, BM25, and production model services are connected.
