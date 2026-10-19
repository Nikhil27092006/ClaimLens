from query_pipeline.app.schemas.retrieval import RetrievalCandidate, RetrievalFilters


def matches_filters(candidate: RetrievalCandidate, filters: RetrievalFilters) -> bool:
    if filters.sections and candidate.section not in filters.sections:
        return False
    if filters.content_types and candidate.content_type not in filters.content_types:
        return False
    if filters.page_start and candidate.page_end < filters.page_start:
        return False
    if filters.page_end and candidate.page_start > filters.page_end:
        return False
    return True
