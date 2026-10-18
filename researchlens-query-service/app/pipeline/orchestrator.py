from uuid import uuid4
from time import perf_counter

from app.citations.mapper import map_citations, map_claim
from app.citations.source_ids import assign_source_ids
from app.config import Settings
from app.guardrails.evidence_guard import require_evidence
from app.guardrails.policies import (
    INSUFFICIENT_EVIDENCE_MESSAGE,
    NO_READY_PAPERS_MESSAGE,
)
from app.observability.logging import get_logger
from app.pipeline.evidence_balancing import balance_evidence
from app.pipeline.deduplication import deduplicate
from app.pipeline.classification import classify_question
from app.pipeline.context_compression import compress_context
from app.pipeline.evidence_selection import select_evidence
from app.pipeline.filters import matches_filters
from app.pipeline.rewriting import rewrite_query
from app.pipeline.thresholds import above_relevance_threshold
from app.pipeline.validation import validate_query
from app.providers.embedding_provider import EmbeddingProvider
from app.providers.nemotron_provider import GenerationProvider
from app.providers.qdrant_provider import DenseRetriever
from app.providers.bm25_provider import SparseRetriever
from app.providers.reranker_provider import RerankerProvider
from app.repositories.chunk_repository import ChunkRepository
from app.repositories.paper_repository import PaperRepository
from app.schemas.query import QueryRequest, QueryResponse


logger = get_logger(__name__)


class QueryOrchestrator:
    def __init__(
        self,
        settings: Settings,
        embedding_provider: EmbeddingProvider,
        dense_retriever: DenseRetriever,
        generator: GenerationProvider,
        paper_repository: PaperRepository,
        chunk_repository: ChunkRepository,
        sparse_retriever: SparseRetriever | None = None,
        reranker: RerankerProvider | None = None,
        answer_repository: object | None = None,
    ) -> None:
        self.settings = settings
        self.embedding_provider = embedding_provider
        self.dense_retriever = dense_retriever
        self.generator = generator
        self.paper_repository = paper_repository
        self.chunk_repository = chunk_repository
        self.sparse_retriever = sparse_retriever
        self.reranker = reranker
        self.answer_repository = answer_repository

    async def run(self, workspace_id: str, request: QueryRequest) -> QueryResponse:
        query_id = str(uuid4())
        started = perf_counter()
        if len(request.question) > self.settings.max_question_length:
            raise ValueError("Question exceeds the configured maximum length")
        if len(request.paper_ids) > self.settings.max_papers_per_query:
            raise ValueError("Too many papers selected")
        validation = await validate_query(
            request,
            workspace_id,
            self.paper_repository,
            self.chunk_repository,
        )
        if validation.status == "no_ready_papers":
            return QueryResponse(
                query_id=query_id,
                answer=NO_READY_PAPERS_MESSAGE,
                pipeline_status="no_ready_papers",
                uncertainties=["No selected paper is ready with indexed chunks."],
            )

        query_type = classify_question(request.question, len(validation.ready_paper_ids))
        rewritten_query = rewrite_query(request.question)
        embedding = await self.embedding_provider.embed(rewritten_query)
        candidates = await self.dense_retriever.search(
            embedding=embedding,
            workspace_id=workspace_id,
            paper_ids=list(validation.ready_paper_ids),
            filters=request.filters,
            limit=self.settings.top_k_dense,
        )
        if self.sparse_retriever is not None:
            sparse = await self.sparse_retriever.search(
                rewritten_query,
                workspace_id,
                list(validation.ready_paper_ids),
                request.filters,
                self.settings.top_k_sparse,
            )
            from app.pipeline.fusion import reciprocal_rank_fusion

            candidates = reciprocal_rank_fusion([candidates, sparse])
        if self.reranker is not None and candidates:
            candidates = await self.reranker.rerank(
                request.question, candidates, self.settings.top_k_reranked
            )
        candidates = [
            candidate
            for candidate in candidates
            if matches_filters(candidate, request.filters)
        ]
        candidates = deduplicate(candidates)
        candidates = above_relevance_threshold(
            candidates, self.settings.min_relevance_score
        ) or candidates
        if not candidates:
            return QueryResponse(
                query_id=query_id,
                answer=INSUFFICIENT_EVIDENCE_MESSAGE,
                pipeline_status="insufficient_evidence",
                uncertainties=["No retrieved evidence passed the relevance threshold."],
            )

        candidates = balance_evidence(
            candidates,
            list(validation.ready_paper_ids),
            max(1, self.settings.top_k_reranked // max(1, len(validation.ready_paper_ids))),
        )
        evidence = select_evidence(candidates, self.settings.top_k_reranked)
        evidence = compress_context(evidence, self.settings.max_context_tokens)
        evidence = assign_source_ids([item.candidate for item in evidence])
        require_evidence(evidence)
        generated = await self.generator.generate(rewritten_query, evidence)
        claims = [map_claim(claim, evidence) for claim in generated.claims]
        citations = map_citations(evidence)
        response = QueryResponse(
            query_id=query_id,
            answer=generated.answer,
            claims=claims,
            citations=citations,
            uncertainties=generated.uncertainties,
            pipeline_status="completed",
        )
        logger.info(
            "query_complete query_id=%s query_type=%s status=%s candidates=%d "
            "evidence=%d latency_ms=%.2f",
            query_id,
            query_type,
            response.pipeline_status,
            len(candidates),
            len(evidence),
            (perf_counter() - started) * 1000,
        )
        if self.answer_repository is not None:
            await self.answer_repository.save(response)
        return response