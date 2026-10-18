from query_pipeline.app.schemas.retrieval import EvidenceSource, RetrievalCandidate


def assign_source_ids(candidates: list[RetrievalCandidate]) -> list[EvidenceSource]:
    return [EvidenceSource(source_id=f"S{i}", candidate=item)
            for i, item in enumerate(candidates, 1)]
