from query_pipeline.app.providers.qdrant_provider import DenseRetriever
from query_pipeline.app.schemas.retrieval import RetrievalCandidate, RetrievalFilters


async def retrieve_dense(provider: DenseRetriever, embedding: list[float],
                         workspace_id: str, paper_ids: list[str],
                         filters: RetrievalFilters, limit: int) -> list[RetrievalCandidate]:
    return await provider.search(embedding, workspace_id, paper_ids, filters, limit)
