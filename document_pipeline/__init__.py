"""Document ingestion and indexing pipeline."""
"""PDF document ingestion and embedding pipeline."""

from document_pipeline.pipeline import (
    IndexingResult,
    PreparedPaper,
    index_prepared_paper,
    ingest_and_embed_pdf,
)
from document_pipeline.service import index_pdf

__all__ = [
    "IndexingResult",
    "PreparedPaper",
    "index_prepared_paper",
    "ingest_and_embed_pdf",
    "index_pdf",
]
