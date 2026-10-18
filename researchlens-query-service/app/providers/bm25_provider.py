from typing import Protocol

from app.schemas.retrieval import RetrievalCandidate, RetrievalFilters


class SparseRetriever(Protocol):
    async def search(
        self,
        query: str,
        workspace_id: str,
        paper_ids: list[str],
        filters: RetrievalFilters,
        limit: int,
    ) -> list[RetrievalCandidate]:
        ...


class InMemoryBM25Retriever:
    def __init__(self, candidates: list[RetrievalCandidate]) -> None:
        self.candidates = candidates

    async def search(
        self,
        query: str,
        workspace_id: str,
        paper_ids: list[str],
        filters: RetrievalFilters,
        limit: int,
    ) -> list[RetrievalCandidate]:
        from app.pipeline.filters import matches_filters

        terms = set(query.lower().split())
        scored: list[RetrievalCandidate] = []
        for candidate in self.candidates:
            if (
                candidate.workspace_id != workspace_id
                or candidate.paper_id not in paper_ids
                or not matches_filters(candidate, filters)
            ):
                continue
            score = sum(term in candidate.text.lower() for term in terms)
            if score:
                scored.append(candidate.model_copy(update={"sparse_score": float(score)}))
        return sorted(
            scored, key=lambda item: item.sparse_score or 0.0, reverse=True
        )[:limit]