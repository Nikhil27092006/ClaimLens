"""Small, safe metadata model for fields embedded in PDF files."""

from dataclasses import dataclass
from typing import Mapping


@dataclass(frozen=True)
class PDFMetadata:
    title: str | None = None
    author: str | None = None
    subject: str | None = None
    keywords: str | None = None
    creator: str | None = None
    producer: str | None = None
    created_at: str | None = None
    modified_at: str | None = None


def _clean(value: object) -> str | None:
    if not isinstance(value, str):
        return None
    cleaned = value.strip()
    return cleaned or None


def extract_pdf_metadata(values: Mapping[str, object] | None) -> PDFMetadata:
    """Read standard PDF metadata fields without inventing missing values."""
    source = values or {}
    return PDFMetadata(
        title=_clean(source.get("title")),
        author=_clean(source.get("author")),
        subject=_clean(source.get("subject")),
        keywords=_clean(source.get("keywords")),
        creator=_clean(source.get("creator")),
        producer=_clean(source.get("producer")),
        created_at=_clean(source.get("creationDate")),
        modified_at=_clean(source.get("modDate")),
    )