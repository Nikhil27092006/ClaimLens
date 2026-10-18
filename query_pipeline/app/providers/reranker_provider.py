from typing import Protocol

from query_pipeline.app.schemas.retrieval import RetrievalCandidate


class RerankerProvider(Protocol):
    async def rerank(
        self, query: str, candidates: list[RetrievalCandidate], limit: int
    ) -> list[RetrievalCandidate]:
        ...


class ScoreBasedReranker:
    async def rerank(self, query, candidates, limit):
        terms = set(query.lower().split())
        ranked = [
            candidate.model_copy(update={
                "rerank_score": float(sum(term in candidate.text.lower() for term in terms))
            })
            for candidate in candidates
        ]
        return sorted(ranked, key=lambda item: item.rerank_score or 0, reverse=True)[:limit]
