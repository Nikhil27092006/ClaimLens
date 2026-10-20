"""Recognizable research-paper section headings."""

import re


_SECTION_ALIASES: dict[str, tuple[str, ...]] = {
    "Abstract": ("abstract", "summary"),
    "Introduction": ("introduction", "intro"),
    "Background": ("background", "preliminaries"),
    "Related Work": ("related work", "literature review", "prior work"),
    "Methods": (
        "method",
        "methods",
        "methodology",
        "materials and methods",
        "experimental setup",
    ),
    "Results": ("result", "results", "findings"),
    "Evaluation": ("evaluation", "experiments", "experimental results"),
    "Discussion": ("discussion", "analysis"),
    "Limitations": ("limitation", "limitations", "threats to validity"),
    "Conclusion": (
        "conclusion",
        "conclusions",
        "concluding remarks",
        "future work",
    ),
    "Acknowledgements": ("acknowledgements", "acknowledgments"),
    "References": ("references", "bibliography"),
    "Appendix": ("appendix", "appendices", "supplementary material"),
}

_ALIAS_TO_SECTION = {
    alias.casefold(): section
    for section, aliases in _SECTION_ALIASES.items()
    for alias in aliases
}
_ALTERNATIVES = "|".join(
    re.escape(alias)
    for alias in sorted(_ALIAS_TO_SECTION, key=len, reverse=True)
)
_HEADING_PATTERN = re.compile(
    rf"^\s*(?:(?:\d+(?:\.\d+)*|[IVXLCDM]+)[.)]?\s+)?"
    rf"(?P<heading>{_ALTERNATIVES})\s*[:.]?\s*$",
    re.IGNORECASE,
)
_PAGE_NUMBER_SUFFIX = re.compile(r"[ \t]{2,}\d{1,4}[ \t]*$")


def identify_section_heading(line: str) -> str | None:
    """Return the canonical section name when a complete line is a heading.

    Some paper PDFs place a page number in the same text line as the running
    section heading. Remove only a page number separated by multiple spaces.
    """
    candidate = line.rstrip("\r\n")
    candidate = _PAGE_NUMBER_SUFFIX.sub("", candidate)
    match = _HEADING_PATTERN.fullmatch(candidate)
    if match is None:
        return None
    return _ALIAS_TO_SECTION[match.group("heading").casefold()]