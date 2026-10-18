from app.schemas.retrieval import EvidenceSource


def require_evidence(evidence: list[EvidenceSource]) -> None:
    if not evidence:
        raise ValueError("Evidence is required before generation")