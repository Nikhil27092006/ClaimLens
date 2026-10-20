"""Interfaces and records for chunk embedding."""

from dataclasses import dataclass
from typing import Protocol

from document_pipeline.chunking.page_aware_chunker import IngestionChunk


class EmbeddingProvider(Protocol):
    """Compatible with the query pipeline's async single-text provider."""

    async def embed(self, text: str) -> list[float]:
        ...


@dataclass(frozen=True)
class EmbeddedChunk:
    """An ingestion chunk paired with its dense vector."""

    chunk: IngestionChunk
    vector: tuple[float, ...]