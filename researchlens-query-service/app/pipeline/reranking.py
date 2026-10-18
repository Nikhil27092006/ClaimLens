from app.providers.reranker_provider import RerankerProvider
from app.schemas.retrieval import RetrievalCandidate


async def rerank(
    provider: RerankerProvider,
    query: str,
    candidates: list[RetrievalCandidate],
    limit: int,
) -> list[RetrievalCandidate]:
    return await provider.rerank(query, candidates, limit)