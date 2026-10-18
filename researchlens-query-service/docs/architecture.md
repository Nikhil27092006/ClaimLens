# Architecture

The API route delegates to `QueryOrchestrator`. The orchestrator validates
workspace-scoped ready papers, embeds the question, retrieves candidates,
optionally fuses sparse results and reranks them, assigns source IDs, calls a
generation provider, and validates/maps citations.

Repositories and providers are protocols. This keeps ingestion, Qdrant, BM25,
NeMo Retriever, and Nemotron integrations replaceable and testable with fakes.