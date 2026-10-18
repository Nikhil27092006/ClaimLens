from query_pipeline.app.schemas.retrieval import EvidenceSource, RetrievalCandidate


def select_evidence(candidates: list[RetrievalCandidate], limit: int) -> list[EvidenceSource]:
    return [EvidenceSource(source_id=f"S{i}", candidate=item)
            for i, item in enumerate(candidates[:limit], 1)]
