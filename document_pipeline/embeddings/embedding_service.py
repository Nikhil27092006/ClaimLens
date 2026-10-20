"""Generate and validate dense embeddings for ingestion chunks."""

import asyncio
import math
from collections.abc import Sequence

from document_pipeline.chunking.page_aware_chunker import IngestionChunk
from document_pipeline.embeddings.base import EmbeddedChunk, EmbeddingProvider


class EmbeddingError(RuntimeError):
    """Raised when a provider returns an unusable embedding vector."""


class EmbeddingDimensionError(EmbeddingError):
    """Raised when a vector does not match the configured index dimension."""


async def embed_chunks(
    chunks: Sequence[IngestionChunk],
    provider: EmbeddingProvider,
    *,
    expected_dimension: int = 2048,
    max_concurrency: int = 4,
) -> tuple[EmbeddedChunk, ...]:
    """Embed chunks concurrently while preserving input order.

    Provider/network errors are allowed to propagate so callers can report an
    explicit upstream failure. No fake vector or silent fallback is returned.
    """
    if expected_dimension < 1:
        raise ValueError("expected_dimension must be positive")
    if max_concurrency < 1:
        raise ValueError("max_concurrency must be positive")

    semaphore = asyncio.Semaphore(max_concurrency)

    async def embed_one(chunk: IngestionChunk) -> EmbeddedChunk:
        if not chunk.text.strip():
            raise EmbeddingError(f"Chunk {chunk.chunk_id} has no text to embed")
        async with semaphore:
            raw_vector = await provider.embed(chunk.text)

        try:
            vector = tuple(float(value) for value in raw_vector)
        except (TypeError, ValueError) as exc:
            raise EmbeddingError(
                f"Embedding provider returned a malformed vector for {chunk.chunk_id}"
            ) from exc

        if len(vector) != expected_dimension:
            raise EmbeddingDimensionError(
                f"Chunk {chunk.chunk_id} produced {len(vector)} dimensions; "
                f"the configured index requires {expected_dimension}"
            )
        if not all(math.isfinite(value) for value in vector):
            raise EmbeddingError(
                f"Embedding provider returned a non-finite value for {chunk.chunk_id}"
            )
        return EmbeddedChunk(chunk=chunk, vector=vector)

    results = await asyncio.gather(*(embed_one(chunk) for chunk in chunks))
    return tuple(results)