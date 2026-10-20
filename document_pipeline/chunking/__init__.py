"""Page-aware document chunking."""

from document_pipeline.chunking.page_aware_chunker import (
    IngestionChunk,
    chunk_page_sections,
)

__all__ = ["IngestionChunk", "chunk_page_sections"]