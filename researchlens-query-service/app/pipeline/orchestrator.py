from uuid import uuid4

from app.citations.mapper import map_citations, map_claim
from app.config import Settings
from app.pipeline.deduplication import deduplicate
from app.pipeline.evidence_selection import select_evidence
from app.pipeline.validation import validate_query
from app.providers.embedding_provider import EmbeddingProvider
from app.providers.nemotron_provider import GenerationProvider
from app.providers.qdrant_provider import DenseRetriever
from app.providers.bm25_provider import SparseRetriever
from app.providers.reranker_provider import RerankerProvider
from app.repositories.chunk_repository import ChunkRepository
from app.repositories.paper_repository import PaperRepository
from app.schemas.query import QueryRequest, QueryResponse


INSUFFICIENT_EVIDENCE = (
    "The uploaded papers do not provide sufficient evidence to answer this question."
)


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
    ) -> None:
        self.settings = settings
        self.embedding_provider = embedding_provider
        self.dense_retriever = dense_retriever
        self.generator = generator
        self.paper_repository = paper_repository
        self.chunk_repository = chunk_repository
        self.sparse_retriever = sparse_retriever
        self.reranker = reranker

    async def run(self, workspace_id: str, request: QueryRequest) -> QueryResponse:
        query_id = str(uuid4())
        validation = await validate_query(
            request,
            workspace_id,
            self.paper_repository,
            self.chunk_repository,
        )
        if validation.status == "no_ready_papers":
            return QueryResponse(
                query_id=query_id,
                answer="Please upload and process at least one research paper before asking a question.",
                pipeline_status="no_ready_papers",
                uncertainties=["No selected paper is ready with indexed chunks."],
            )

        embedding = await self.embedding_provider.embed(request.question)
        candidates = await self.dense_retriever.search(
            embedding=embedding,
            workspace_id=workspace_id,
            paper_ids=list(validation.ready_paper_ids),
            filters=request.filters,
            limit=self.settings.top_k_dense,
        )
        if self.sparse_retriever is not None:
            sparse = await self.sparse_retriever.search(
                request.question,
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
        candidates = deduplicate(candidates)
        if not candidates:
            return QueryResponse(
                query_id=query_id,
                answer=INSUFFICIENT_EVIDENCE,
                pipeline_status="insufficient_evidence",
                uncertainties=["No retrieved evidence passed the relevance threshold."],
            )

        evidence = select_evidence(candidates, self.settings.top_k_reranked)
        generated = await self.generator.generate(request.question, evidence)
        claims = [map_claim(claim, evidence) for claim in generated.claims]
        citations = map_citations(evidence)
        return QueryResponse(
            query_id=query_id,
            answer=generated.answer,
            claims=claims,
            citations=citations,
            uncertainties=generated.uncertainties,
            pipeline_status="completed",
        )