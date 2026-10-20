"""PDF ingestion and text extraction."""

from document_pipeline.ingestion.metadata_extractor import (
    PDFMetadata,
    extract_pdf_metadata,
)
from document_pipeline.ingestion.ocr_engine import OCRProcessingError
from document_pipeline.ingestion.pdf_loader import (
    EmptyPDFError,
    EncryptedPDFError,
    InvalidPDFError,
    PDFDependencyError,
    PDFLoadError,
)
from document_pipeline.ingestion.pymupdf_extractor import (
    ExtractedDocument,
    ExtractedPage,
    extract_pdf_text,
)
from document_pipeline.ingestion.service import (
    IngestedPaper,
    NoExtractableTextError,
    ingest_pdf,
)

__all__ = [
    "EmptyPDFError",
    "EncryptedPDFError",
    "ExtractedDocument",
    "ExtractedPage",
    "IngestedPaper",
    "InvalidPDFError",
    "NoExtractableTextError",
    "OCRProcessingError",
    "PDFDependencyError",
    "PDFLoadError",
    "PDFMetadata",
    "extract_pdf_metadata",
    "extract_pdf_text",
    "ingest_pdf",
]