"""End-to-end PDF ingestion through page-aware chunk creation."""

from dataclasses import dataclass
from pathlib import Path

from document_pipeline.chunking.page_aware_chunker import (
    IngestionChunk,
    chunk_page_sections,
)
from document_pipeline.ingestion.metadata_extractor import PDFMetadata
from document_pipeline.ingestion.pdf_loader import PDFSource
from document_pipeline.ingestion.pymupdf_extractor import (
    ExtractedPage,
    extract_pdf_text,
)
from document_pipeline.section_detection.detector import (
    PageSection,
    detect_page_sections,
)


class NoExtractableTextError(ValueError):
    """Raised when no text is available to create searchable chunks."""


@dataclass(frozen=True)
class IngestedPaper:
    workspace_id: str
    paper_id: str
    paper_title: str
    source_name: str | None
    metadata: PDFMetadata
    pages: tuple[ExtractedPage, ...]
    sections: tuple[PageSection, ...]
    chunks: tuple[IngestionChunk, ...]


def ingest_pdf(
    source: PDFSource,
    *,
    workspace_id: str,
    paper_id: str,
    paper_title: str | None = None,
    ocr_fallback: bool = True,
    ocr_language: str = "eng",
    ocr_dpi: int = 300,
    minimum_text_characters: int = 40,
    max_chunk_tokens: int = 500,
    overlap_tokens: int = 50,
) -> IngestedPaper:
    """Process a PDF into metadata, page text, sections, and indexed-ready chunks.

    This function prepares records for embeddings and storage, but deliberately
    does not mark the paper ready or write to Qdrant/BM25. A caller should only
    mark it queryable after those index writes succeed.
    """
    if not workspace_id.strip() or not paper_id.strip():
        raise ValueError("workspace_id and paper_id are required")

    extracted = extract_pdf_text(
        source,
        ocr_fallback=ocr_fallback,
        ocr_language=ocr_language,
        ocr_dpi=ocr_dpi,
        minimum_text_characters=minimum_text_characters,
    )
    resolved_title = (
        paper_title.strip()
        if paper_title and paper_title.strip()
        else extracted.metadata.title
    )
    if not resolved_title and extracted.source_name:
        resolved_title = Path(extracted.source_name).stem
    if not resolved_title:
        resolved_title = paper_id

    all_sections: list[PageSection] = []
    active_section: str | None = None
    for page in extracted.pages:
        page_sections, active_section = detect_page_sections(
            page.text,
            page.page_number,
            initial_section=active_section,
        )
        all_sections.extend(page_sections)

    chunks = chunk_page_sections(
        all_sections,
        workspace_id=workspace_id,
        paper_id=paper_id,
        paper_title=resolved_title,
        max_tokens=max_chunk_tokens,
        overlap_tokens=overlap_tokens,
    )
    if not chunks:
        raise NoExtractableTextError(
            "No text could be extracted from the PDF. It may be blank or require OCR."
        )

    return IngestedPaper(
        workspace_id=workspace_id,
        paper_id=paper_id,
        paper_title=resolved_title,
        source_name=extracted.source_name,
        metadata=extracted.metadata,
        pages=extracted.pages,
        sections=tuple(all_sections),
        chunks=chunks,
    )