"""Convenience entry point for preparing a paper for downstream indexing."""

import asyncio
from dataclasses import dataclass

from document_pipeline.embeddings import (
    EmbeddedChunk,
    EmbeddingProvider,
    embed_chunks,
)
from document_pipeline.ingestion import IngestedPaper, ingest_pdf
from document_pipeline.ingestion.pdf_loader import PDFSource
from document_pipeline.indexing import BM25Indexer, QdrantVectorIndexer


@dataclass(frozen=True)
class PreparedPaper:
    """An ingested paper with validated embeddings, ready for indexing."""

    paper: IngestedPaper
    embedded_chunks: tuple[EmbeddedChunk, ...]


@dataclass(frozen=True)
class IndexingResult:
    """Counts written to both indexes; this does not update paper readiness."""

    workspace_id: str
    paper_id: str
    qdrant_points: int
    bm25_documents: int


async def index_prepared_paper(
    prepared: PreparedPaper,
    *,
    vector_indexer: QdrantVectorIndexer,
    bm25_indexer: BM25Indexer,
) -> IndexingResult:
    """Write prepared chunks to Qdrant and BM25, leaving readiness to the caller.

    If the BM25 write fails after the Qdrant write, the paper must remain
    unqueryable. Retrying is safe because both indexers upsert by chunk ID.
    """
    if len(prepared.paper.chunks) != len(prepared.embedded_chunks):
        raise ValueError("Every paper chunk must have exactly one embedding")

    qdrant_count = await vector_indexer.upsert_chunks(prepared.embedded_chunks)
    bm25_count = await asyncio.to_thread(
        bm25_indexer.upsert_chunks,
        prepared.paper.chunks,
    )
    expected_count = len(prepared.paper.chunks)
    if qdrant_count != expected_count or bm25_count != expected_count:
        raise RuntimeError(
            "Index write count did not match the prepared chunk count; "
            "leave the paper unqueryable and retry or inspect the indexes"
        )
    return IndexingResult(
        workspace_id=prepared.paper.workspace_id,
        paper_id=prepared.paper.paper_id,
        qdrant_points=qdrant_count,
        bm25_documents=bm25_count,
    )


async def ingest_and_embed_pdf(
    source: PDFSource,
    *,
    workspace_id: str,
    paper_id: str,
    embedding_provider: EmbeddingProvider,
    expected_dimension: int = 2048,
    max_embedding_concurrency: int = 4,
    paper_title: str | None = None,
    ocr_fallback: bool = True,
    ocr_language: str = "eng",
    ocr_dpi: int = 300,
    minimum_text_characters: int = 40,
    max_chunk_tokens: int = 500,
    overlap_tokens: int = 50,
) -> PreparedPaper:
    """Ingest a PDF and embed its chunks without writing to external indexes.

    A paper returned here is prepared for Qdrant/BM25 indexing, but is not
    queryable yet. Callers should publish it as ready only after every index
    write has succeeded.
    """
    paper = ingest_pdf(
        source,
        workspace_id=workspace_id,
        paper_id=paper_id,
        paper_title=paper_title,
        ocr_fallback=ocr_fallback,
        ocr_language=ocr_language,
        ocr_dpi=ocr_dpi,
        minimum_text_characters=minimum_text_characters,
        max_chunk_tokens=max_chunk_tokens,
        overlap_tokens=overlap_tokens,
    )
    embedded_chunks = await embed_chunks(
        paper.chunks,
        embedding_provider,
        expected_dimension=expected_dimension,
        max_concurrency=max_embedding_concurrency,
    )
    return PreparedPaper(paper=paper, embedded_chunks=embedded_chunks)
