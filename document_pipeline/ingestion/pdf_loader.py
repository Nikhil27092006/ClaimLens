"""Safe, resource-managed opening of PDF documents for ingestion."""

from contextlib import contextmanager
from pathlib import Path
from typing import Any, BinaryIO, Iterator


class PDFLoadError(ValueError):
    """Base error raised when an input cannot be loaded as a usable PDF."""


class PDFDependencyError(RuntimeError):
    """Raised when the PyMuPDF runtime dependency is missing."""


class InvalidPDFError(PDFLoadError):
    """Raised when the input is not a readable PDF document."""


class EncryptedPDFError(PDFLoadError):
    """Raised when a PDF requires a password before its pages can be read."""


class EmptyPDFError(PDFLoadError):
    """Raised when a PDF contains no pages."""


PDFSource = str | Path | bytes | bytearray | BinaryIO


@contextmanager
def open_pdf_document(source: PDFSource) -> Iterator[Any]:
    """Open a PDF path, byte string, or binary stream and always close it.

    The returned document is valid only inside the ``with`` block. The function
    does not write or modify the source file.
    """
    try:
        import pymupdf
    except ImportError as exc:
        raise PDFDependencyError(
            "PDF extraction requires PyMuPDF. Install "
            "document_pipeline/requirements.txt."
        ) from exc

    if isinstance(source, (str, Path)):
        path = Path(source)
        if not path.is_file():
            raise FileNotFoundError(f"PDF file does not exist: {path}")
        try:
            document = pymupdf.open(path)
        except Exception as exc:
            raise InvalidPDFError("The input is not a readable PDF") from exc
    elif isinstance(source, (bytes, bytearray)):
        if not source:
            raise InvalidPDFError("PDF input is empty")
        try:
            document = pymupdf.open(stream=bytes(source), filetype="pdf")
        except Exception as exc:
            raise InvalidPDFError("The input is not a readable PDF") from exc
    elif hasattr(source, "read"):
        contents = source.read()
        if not isinstance(contents, (bytes, bytearray)):
            raise InvalidPDFError("PDF streams must be opened in binary mode")
        if not contents:
            raise InvalidPDFError("PDF input is empty")
        try:
            document = pymupdf.open(stream=bytes(contents), filetype="pdf")
        except Exception as exc:
            raise InvalidPDFError("The input is not a readable PDF") from exc
    else:
        raise TypeError("source must be a PDF path, bytes, or binary stream")

    try:
        if document.needs_pass:
            raise EncryptedPDFError("Password-protected PDFs are not supported")
        if document.page_count == 0:
            raise EmptyPDFError("The PDF contains no pages")
        yield document
    finally:
        document.close()