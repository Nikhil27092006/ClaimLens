from query_pipeline.app.schemas.generation import GeneratedAnswer, GeneratedClaim
from query_pipeline.app.schemas.retrieval import EvidenceSource, RetrievalCandidate, RetrievalFilters
from query_pipeline.app.pipeline.filters import matches_filters


class FakeEmbeddingProvider:
    async def embed(self, text: str) -> list[float]:
        if not text.strip():
            raise ValueError("Cannot embed empty text")
        return [0.1, 0.2, 0.3]


class FakeDenseRetriever:
    def __init__(self, candidates: list[RetrievalCandidate]) -> None:
        self.candidates = candidates

    async def search(self, embedding, workspace_id, paper_ids, filters, limit):
        del embedding
        return [
            item for item in self.candidates
            if item.workspace_id == workspace_id
            and item.paper_id in paper_ids
            and matches_filters(item, filters)
        ][:limit]


class FakeSparseRetriever(FakeDenseRetriever):
    async def search(self, query, workspace_id, paper_ids, filters, limit):
        del query
        return await super().search([], workspace_id, paper_ids, filters, limit)


class FakeReranker:
    async def rerank(self, query, candidates, limit):
        del query
        return candidates[:limit]


class FakeGenerator:
    async def generate(self, question: str, evidence: list[EvidenceSource]):
        del question
        if not evidence:
            raise ValueError("Generation requires evidence")
        item = evidence[0]
        return GeneratedAnswer(
            answer=f"Based on the retrieved evidence: {item.candidate.text}",
            claims=[GeneratedClaim(
                text=item.candidate.text, source_ids=[item.source_id],
                claim_type="fact", confidence=1.0
            )],
        )
