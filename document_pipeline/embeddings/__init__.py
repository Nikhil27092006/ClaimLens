"""Dense embedding generation for document chunks."""

from document_pipeline.embeddings.base import EmbeddedChunk, EmbeddingProvider
from document_pipeline.embeddings.embedding_service import (
    EmbeddingDimensionError,
    EmbeddingError,
    embed_chunks,
)

__all__ = [
    "EmbeddedChunk",
    "EmbeddingDimensionError",
    "EmbeddingError",
    "EmbeddingProvider",
    "embed_chunks",
]