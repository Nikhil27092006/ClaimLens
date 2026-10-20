"""Whitespace-token spans for lossless, dependency-free chunk sizing."""

import re
from dataclasses import dataclass

_TOKEN_PATTERN = re.compile(r"\S+")


@dataclass(frozen=True)
class TokenSpan:
    start: int
    end: int


def tokenize_with_spans(text: str) -> tuple[TokenSpan, ...]:
    """Return word-like spans while leaving all original text untouched."""
    return tuple(
        TokenSpan(match.start(), match.end())
        for match in _TOKEN_PATTERN.finditer(text)
    )


def count_tokens(text: str) -> int:
    """Count whitespace-separated tokens as a sizing proxy."""
    return len(tokenize_with_spans(text))