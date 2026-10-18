from app.schemas.generation import GeneratedClaim
from app.schemas.retrieval import EvidenceSource


def has_claim_sources(
    claim: GeneratedClaim, evidence: list[EvidenceSource]
) -> bool:
    valid_ids = {source.source_id for source in evidence}
    return bool(claim.source_ids) and set(claim.source_ids).issubset(valid_ids)