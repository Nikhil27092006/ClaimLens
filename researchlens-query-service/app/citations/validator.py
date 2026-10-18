from app.schemas.citation import CitationStatus
from app.schemas.generation import GeneratedClaim
from app.schemas.retrieval import EvidenceSource


def validate_claim(
    claim: GeneratedClaim, evidence: list[EvidenceSource]
) -> CitationStatus:
    sources = {source.source_id for source in evidence}
    if not claim.source_ids or not set(claim.source_ids).issubset(sources):
        return "invalid"
    return "valid"