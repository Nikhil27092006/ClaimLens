"""OCR fallback backed by PyMuPDF's Tesseract integration."""

from typing import Any


class OCRProcessingError(RuntimeError):
    """Raised when OCR is needed but cannot be completed."""


def extract_page_with_ocr(
    page: Any,
    *,
    language: str = "eng",
    dpi: int = 300,
) -> str:
    """Recognize text on a scanned page using the installed Tesseract runtime.

    PyMuPDF requires Tesseract and the requested language data to be installed
    separately. OCR is deliberately called only for pages selected by the
    extractor, since it is much slower than native PDF text extraction.
    """
    if dpi < 72:
        raise ValueError("OCR dpi must be at least 72")
    if not language.strip():
        raise ValueError("OCR language must not be empty")

    try:
        text_page = page.get_textpage_ocr(
            language=language,
            dpi=dpi,
            full=True,
        )
        return page.get_text("text", textpage=text_page, sort=True)
    except Exception as exc:
        page_number = getattr(page, "number", None)
        page_label = f" on page {page_number + 1}" if page_number is not None else ""
        raise OCRProcessingError(
            "OCR could not process the PDF page" + page_label + ". "
            "Install Tesseract OCR and its language data, then retry."
        ) from exc