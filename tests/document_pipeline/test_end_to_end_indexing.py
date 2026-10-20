"""Local integration check for ingestion, embeddings, Qdrant, and BM25."""

from pathlib import Path

import pymupdf
import pytest
from qdrant_client import QdrantClient, models

from document_pipeline import ingest_and_embed_pdf, index_prepared_paper
from document_pipeline.indexing import BM25Indexer, QdrantVectorIndexer


class FixedEmbeddingProvider:
    async def embed(self, text: str) -> list[float]:
        return [0.1, 0.2, 0.3, 0.4]


def make_pdf() -> bytes:
    document = pymupdf.open()
    page = document.new_page()
    page.insert_text(
        (72, 72),
        "Introduction\n"
        "This paper presents evidence for reliable document indexing. "
        "The evidence supports repeatable retrieval across pages. "
        "Additional results compare retrieval quality and evidence coverage.",
        fontsize=11,
    )
    pdf_bytes = document.tobytes()
    document.close()
    return pdf_bytes


@pytest.mark.asyncio
async def test_pdf_can_be_embedded_and_indexed_repeatedly(tmp_path: Path) -> None:
    prepared = await ingest_and_embed_pdf(
        make_pdf(),
        workspace_id="workspace-test",
        paper_id="paper-test",
        embedding_provider=FixedEmbeddingProvider(),
        expected_dimension=4,
        max_chunk_tokens=12,
        overlap_tokens=2,
    )
    assert prepared.paper.chunks
    assert len(prepared.paper.chunks) == len(prepared.embedded_chunks)

    client = QdrantClient(":memory:")
    bm25_indexer = BM25Indexer(tmp_path / "bm25.sqlite3")
    vector_indexer = QdrantVectorIndexer(
        client,
        collection_name="paper_chunks_test",
        vector_dimension=4,
    )
    try:
        first_result = await index_prepared_paper(
            prepared,
            vector_indexer=vector_indexer,
            bm25_indexer=bm25_indexer,
        )
        second_result = await index_prepared_paper(
            prepared,
            vector_indexer=vector_indexer,
            bm25_indexer=bm25_indexer,
        )

        expected_count = len(prepared.paper.chunks)
        assert first_result.qdrant_points == expected_count
        assert first_result.bm25_documents == expected_count
        assert second_result == first_result
        assert client.count("paper_chunks_test", exact=True).count == expected_count
        assert client.count(
            "paper_chunks_test",
            count_filter=models.Filter(
                must=[
                    models.FieldCondition(
                        key="workspace_id",
                        match=models.MatchValue(value="workspace-test"),
                    ),
                    models.FieldCondition(
                        key="paper_id",
                        match=models.MatchValue(value="paper-test"),
                    ),
                ]
            ),
            exact=True,
        ).count == expected_count

        qdrant_points, _ = client.scroll(
            collection_name="paper_chunks_test",
            limit=100,
            with_payload=True,
            with_vectors=False,
        )
        qdrant_ids = {point.payload["chunk_id"] for point in qdrant_points}
        bm25_hits = bm25_indexer.search(
            "evidence retrieval",
            workspace_id="workspace-test",
            paper_ids=["paper-test"],
            limit=100,
        )
        bm25_ids = {hit.chunk.chunk_id for hit in bm25_hits}

        assert qdrant_ids == {chunk.chunk_id for chunk in prepared.paper.chunks}
        assert bm25_ids
        assert bm25_ids <= qdrant_ids
        assert all(hit.chunk.workspace_id == "workspace-test" for hit in bm25_hits)
    finally:
        client.close()
