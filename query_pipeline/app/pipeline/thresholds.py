from query_pipeline.app.schemas.retrieval import RetrievalCandidate


def above_relevance_threshold(
    candidates: list[RetrievalCandidate], threshold: float
) -> list[RetrievalCandidate]:
    def score(item: RetrievalCandidate) -> float | None:
        return next(
            (
                value
                for value in (
                    item.rerank_score,
                    item.fusion_score,
                    item.dense_score,
                    item.sparse_score,
                )
                if value is not None
            ),
            None,
        )

    return [
        item for item in candidates
        if score(item) is not None and score(item) >= threshold
    ]
