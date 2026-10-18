from app.providers.bm25_provider import SparseRetriever
from app.schemas.retrieval import RetrievalCandidate, RetrievalFilters


async def retrieve_sparse(
    provider: SparseRetriever,
    query: str,
    workspace_id: str,
    paper_ids: list[str],
    filters: RetrievalFilters,
    limit: int,
) -> list[RetrievalCandidate]:
    return await provider.search(query, workspace_id, paper_ids, filters, limit)