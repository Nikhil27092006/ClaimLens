from query_pipeline.app.schemas.citation import Citation


def render_citation(citation: Citation) -> str:
    page = str(citation.page_start)
    if citation.page_end != citation.page_start:
        page = f"{citation.page_start}-{citation.page_end}"
    return f"[{citation.paper_title}, p. {page}]"
