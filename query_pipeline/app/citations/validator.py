from query_pipeline.app.schemas.citation import CitationStatus
from query_pipeline.app.schemas.generation import GeneratedClaim
from query_pipeline.app.schemas.retrieval import EvidenceSource


def validate_claim(claim: GeneratedClaim, evidence: list[EvidenceSource]) -> CitationStatus:
    valid_ids = {item.source_id for item in evidence}
    return "valid" if claim.source_ids and set(claim.source_ids) <= valid_ids else "invalid"
