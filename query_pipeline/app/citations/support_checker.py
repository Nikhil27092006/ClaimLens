from query_pipeline.app.schemas.generation import GeneratedClaim
from query_pipeline.app.schemas.retrieval import EvidenceSource
import re


def has_claim_sources(
    claim: GeneratedClaim, evidence: list[EvidenceSource]
) -> bool:
    valid_ids = {source.source_id for source in evidence}
    return bool(claim.source_ids) and set(claim.source_ids).issubset(valid_ids)


def check_claim_support(
    claim: GeneratedClaim, evidence: list[EvidenceSource]
) -> str:
    if not has_claim_sources(claim, evidence):
        return "insufficient"
    cited = " ".join(
        item.candidate.text.lower()
        for item in evidence
        if item.source_id in claim.source_ids
    )
    claim_numbers = re.findall(r"\b\d+(?:\.\d+)?\b", claim.text)
    evidence_numbers = re.findall(r"\b\d+(?:\.\d+)?\b", cited)
    if claim_numbers and evidence_numbers and set(claim_numbers) != set(evidence_numbers):
        return "contradicts"
    claim_terms = {term.strip(".,:;!?()") for term in claim.text.lower().split()}
    if claim_terms and claim_terms.intersection(set(cited.split())):
        return "entails"
    return "insufficient"