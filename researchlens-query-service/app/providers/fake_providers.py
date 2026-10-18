from app.schemas.generation import GeneratedAnswer, GeneratedClaim
from app.schemas.retrieval import (
    EvidenceSource,
    RetrievalCandidate,
    RetrievalFilters,
)


class FakeEmbeddingProvider:
    async def embed(self, text: str) -> list[float]:
        if not text.strip():
            raise ValueError("Cannot embed empty text")
        return [float((sum(map(ord, text)) % 100) / 100), 0.5, 0.25]


class FakeDenseRetriever:
    def __init__(self, candidates: list[RetrievalCandidate]) -> None:
        self.candidates = candidates

    async def search(
        self,
        embedding: list[float],
        workspace_id: str,
        paper_ids: list[str],
        filters: RetrievalFilters,
        limit: int,
    ) -> list[RetrievalCandidate]:
        del embedding
        return [
            candidate
            for candidate in self.candidates
            if candidate.workspace_id == workspace_id
            and candidate.paper_id in paper_ids
            and _matches_filters(candidate, filters)
        ][:limit]


class FakeSparseRetriever(FakeDenseRetriever):
    async def search(
        self,
        query: str,
        workspace_id: str,
        paper_ids: list[str],
        filters: RetrievalFilters,
        limit: int,
    ) -> list[RetrievalCandidate]:
        del query
        return await super().search(
            [], workspace_id, paper_ids, filters, limit
        )


class FakeReranker:
    async def rerank(
        self, query: str, candidates: list[RetrievalCandidate], limit: int
    ) -> list[RetrievalCandidate]:
        del query
        return candidates[:limit]


class FakeGenerator:
    async def generate(
        self, question: str, evidence: list[EvidenceSource]
    ) -> GeneratedAnswer:
        if not evidence:
            raise ValueError("Generation requires evidence")
        first = evidence[0]
        return GeneratedAnswer(
            answer=f"Based on the retrieved evidence: {first.candidate.text}",
            claims=[
                GeneratedClaim(
                    text=first.candidate.text,
                    source_ids=[first.source_id],
                    claim_type="fact",
                    confidence=1.0,
                )
            ],
        )


def _matches_filters(
    candidate: RetrievalCandidate, filters: RetrievalFilters
) -> bool:
    if filters.sections and candidate.section not in filters.sections:
        return False
    if filters.content_types and candidate.content_type not in filters.content_types:
        return False
    if filters.page_start and candidate.page_end < filters.page_start:
        return False
    if filters.page_end and candidate.page_start > filters.page_end:
        return False
    return True