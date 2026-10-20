"""Page-level section labeling using explicit research-paper headings."""

from dataclasses import dataclass

from document_pipeline.section_detection.heading_patterns import (
    identify_section_heading,
)


@dataclass(frozen=True)
class PageSection:
    page_number: int
    section: str
    text: str


def detect_page_sections(
    text: str,
    page_number: int,
    *,
    initial_section: str | None = None,
) -> tuple[tuple[PageSection, ...], str | None]:
    """Split page text at recognized headings without changing its contents.

    The active section can be passed from the previous page so text that
    continues across a page boundary keeps the same section label. Heading lines
    are included verbatim in the section they introduce.
    """
    if page_number < 1:
        raise ValueError("page_number must be one-based")
    if not text:
        return (), initial_section

    active_section = initial_section or "Unclassified"
    blocks: list[PageSection] = []
    current_lines: list[str] = []

    def flush() -> None:
        if current_lines:
            blocks.append(
                PageSection(
                    page_number=page_number,
                    section=active_section,
                    text="".join(current_lines),
                )
            )
            current_lines.clear()

    for line in text.splitlines(keepends=True):
        heading = identify_section_heading(line)
        if heading is not None and heading != active_section:
            flush()
            active_section = heading
        current_lines.append(line)

    flush()
    return tuple(blocks), active_section