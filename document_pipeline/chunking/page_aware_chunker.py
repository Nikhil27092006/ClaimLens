"""Lossless page-aware chunk construction for downstream retrieval indexes."""

import hashlib
from dataclasses import dataclass
from typing import Sequence

from document_pipeline.chunking.tokenizer import tokenize_with_spans
from document_pipeline.section_detection.detector import PageSection


@dataclass(frozen=True)
class IngestionChunk:
    chunk_id: str
    workspace_id: str
    paper_id: str
    paper_title: str
    text: str
    page_start: int
    page_end: int
    section: str
    content_type: str
    chunk_index: int
    content_hash: str


def chunk_page_sections(
    sections: Sequence[PageSection],
    *,
    workspace_id: str,
    paper_id: str,
    paper_title: str,
    max_tokens: int = 500,
    overlap_tokens: int = 50,
    first_chunk_index: int = 0,
) -> tuple[IngestionChunk, ...]:
    """Create stable chunks without merging text from different PDF pages.

    Token counts use whitespace-separated spans as a consistent sizing proxy.
    The original text, including punctuation and whitespace, is retained in each
    chunk. Overlap intentionally repeats text between adjacent chunks.
    """
    if max_tokens < 1:
        raise ValueError("max_tokens must be positive")
    if overlap_tokens < 0 or overlap_tokens >= max_tokens:
        raise ValueError("overlap_tokens must be between 0 and max_tokens - 1")
    if first_chunk_index < 0:
        raise ValueError("first_chunk_index must not be negative")
    if not workspace_id.strip() or not paper_id.strip() or not paper_title.strip():
        raise ValueError("workspace_id, paper_id, and paper_title are required")

    chunks: list[IngestionChunk] = []
    next_chunk_index = first_chunk_index
    step = max_tokens - overlap_tokens

    for section in sections:
        spans = tokenize_with_spans(section.text)
        if not spans:
            continue

        token_start = 0
        while token_start < len(spans):
            token_end = min(token_start + max_tokens, len(spans))
            text_start = 0 if token_start == 0 else spans[token_start].start
            text_end = (
                len(section.text)
                if token_end == len(spans)
                else spans[token_end].start
            )
            chunk_text = section.text[text_start:text_end]
            content_hash = hashlib.sha256(chunk_text.encode("utf-8")).hexdigest()
            identity = "\0".join(
                (
                    workspace_id,
                    paper_id,
                    str(section.page_number),
                    section.section,
                    str(next_chunk_index),
                    content_hash,
                )
            )
            chunk_digest = hashlib.sha256(identity.encode("utf-8")).hexdigest()
            chunk_id = "chunk_" + chunk_digest[:32]
            chunks.append(
                IngestionChunk(
                    chunk_id=chunk_id,
                    workspace_id=workspace_id,
                    paper_id=paper_id,
                    paper_title=paper_title,
                    text=chunk_text,
                    page_start=section.page_number,
                    page_end=section.page_number,
                    section=section.section,
                    content_type="text",
                    chunk_index=next_chunk_index,
                    content_hash=content_hash,
                )
            )
            next_chunk_index += 1
            if token_end == len(spans):
                break
            token_start += step

    return tuple(chunks)