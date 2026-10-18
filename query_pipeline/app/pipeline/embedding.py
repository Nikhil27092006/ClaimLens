from query_pipeline.app.providers.embedding_provider import EmbeddingProvider


async def embed_query(provider: EmbeddingProvider, query: str) -> list[float]:
    if not query.strip():
        raise ValueError("Query must not be empty")
    return await provider.embed(query)
