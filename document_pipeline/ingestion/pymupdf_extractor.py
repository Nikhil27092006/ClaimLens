"""Page-preserving text extraction for native and scanned PDFs."""

from dataclasses import dataclass
from pathlib import Path

from document_pipeline.ingestion.metadata_extractor import (
    PDFMetadata,
    extract_pdf_metadata,
)
from document_pipeline.ingestion.ocr_engine import extract_page_with_ocr
from document_pipeline.ingestion.pdf_loader import PDFSource, open_pdf_document


@dataclass(frozen=True)
class ExtractedPage:
    """Text and source page metadata for one one-based PDF page."""

    page_number: int
    text: str
    width: float
    height: float
    used_ocr: bool = False


@dataclass(frozen=True)
class ExtractedDocument:
    """Ordered page-level output from a PDF text extraction run."""

    source_name: str | None
    metadata: PDFMetadata
    pages: tuple[ExtractedPage, ...]

    @property
    def page_count(self) -> int:
        return len(self.pages)


def extract_pdf_text(
    source: PDFSource,
    *,
    ocr_fallback: bool = True,
    ocr_language: str = "eng",
    ocr_dpi: int = 300,
    minimum_text_characters: int = 40,
) -> ExtractedDocument:
    """Extract text page by page, preserving original page boundaries.

    Native PDF text is returned without whitespace normalization. If a page has
    very little native text and contains an embedded image, OCR is used when
    ``ocr_fallback`` is enabled. Page numbers in the result are one-based.
    """
    if minimum_text_characters < 0:
        raise ValueError("minimum_text_characters must not be negative")
    if ocr_dpi < 72:
        raise ValueError("ocr_dpi must be at least 72")

    if isinstance(source, (str, Path)):
        source_name = Path(source).name
    else:
        name = getattr(source, "name", None)
        source_name = Path(name).name if isinstance(name, str) else None

    extracted_pages: list[ExtractedPage] = []
    with open_pdf_document(source) as document:
        metadata = extract_pdf_metadata(document.metadata)
        for page_index in range(document.page_count):
            page = document.load_page(page_index)
            text = page.get_text("text", sort=True)
            non_whitespace_characters = sum(
                not character.isspace() for character in text
            )
            used_ocr = False

            if (
                ocr_fallback
                and non_whitespace_characters < minimum_text_characters
                and page.get_images(full=True)
            ):
                text = extract_page_with_ocr(
                    page,
                    language=ocr_language,
                    dpi=ocr_dpi,
                )
                used_ocr = True

            extracted_pages.append(
                ExtractedPage(
                    page_number=page_index + 1,
                    text=text,
                    width=float(page.rect.width),
                    height=float(page.rect.height),
                    used_ocr=used_ocr,
                )
            )

    return ExtractedDocument(
        source_name=source_name,
        metadata=metadata,
        pages=tuple(extracted_pages),
    )