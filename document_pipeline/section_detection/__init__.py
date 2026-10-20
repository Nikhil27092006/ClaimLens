"""Research-paper section detection."""

from document_pipeline.section_detection.detector import (
    PageSection,
    detect_page_sections,
)
from document_pipeline.section_detection.heading_patterns import (
    identify_section_heading,
)

__all__ = ["PageSection", "detect_page_sections", "identify_section_heading"]