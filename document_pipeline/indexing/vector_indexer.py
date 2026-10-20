"""Qdrant storage for embedded document chunks."""

import asyncio
import math
import uuid
from collections.abc import Sequence

from document_pipeline.embeddings import EmbeddedChunk


class VectorIndexError(RuntimeError):
    """Raised when the configured Qdrant collection is incompatible."""


class QdrantVectorIndexer:
    """Create and upsert dense vectors using the query pipeline's payload contract.

    Pass a synchronous ``qdrant_client.QdrantClient`` instance. Network calls
    run in a worker thread so this adapter can be called from async services.
    """

    def __init__(
        self,
        client: object,
        collection_name: str,
        vector_dimension: int,
        *,
        batch_size: int = 64,
    ) -> None:
        if not collection_name.strip():
            raise ValueError("collection_name must not be empty")
        if vector_dimension < 1:
            raise ValueError("vector_dimension must be positive")
        if batch_size < 1:
            raise ValueError("batch_size must be positive")
        self.client = client
        self.collection_name = collection_name
        self.vector_dimension = vector_dimension
        self.batch_size = batch_size

    async def upsert_chunks(self, chunks: Sequence[EmbeddedChunk]) -> int:
        """Ensure a cosine collection exists, then idempotently upsert chunks."""
        if not chunks:
            return 0
        self._validate_vectors(chunks)
        return await asyncio.to_thread(self._upsert_sync, chunks)

    def _validate_vectors(self, chunks: Sequence[EmbeddedChunk]) -> None:
        for item in chunks:
            if len(item.vector) != self.vector_dimension:
                raise VectorIndexError(
                    f"Chunk {item.chunk.chunk_id} has {len(item.vector)} dimensions; "
                    f"the collection requires {self.vector_dimension}"
                )
            if not all(math.isfinite(value) for value in item.vector):
                raise VectorIndexError(
                    f"Chunk {item.chunk.chunk_id} contains a non-finite vector value"
                )

    def _upsert_sync(self, chunks: Sequence[EmbeddedChunk]) -> int:
        from qdrant_client import models

        self._ensure_collection(models)
        for start in range(0, len(chunks), self.batch_size):
            batch = chunks[start : start + self.batch_size]
            points = [
                models.PointStruct(
                    id=str(uuid.uuid5(uuid.NAMESPACE_URL, item.chunk.chunk_id)),
                    vector=list(item.vector),
                    payload=self._payload(item),
                )
                for item in batch
            ]
            self.client.upsert(
                collection_name=self.collection_name,
                points=points,
                wait=True,
            )
        return len(chunks)

    def _ensure_collection(self, models: object) -> None:
        if not self.client.collection_exists(self.collection_name):
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=models.VectorParams(
                    size=self.vector_dimension,
                    distance=models.Distance.COSINE,
                ),
            )
        else:
            info = self.client.get_collection(self.collection_name)
            vectors = info.config.params.vectors
            if isinstance(vectors, dict):
                raise VectorIndexError(
                    "The configured collection uses named vectors; this indexer "
                    "expects one unnamed dense vector"
                )
            actual_dimension = getattr(vectors, "size", None)
            actual_distance = getattr(vectors, "distance", None)
            if actual_dimension != self.vector_dimension:
                raise VectorIndexError(
                    f"Collection {self.collection_name!r} has dimension "
                    f"{actual_dimension}; expected {self.vector_dimension}"
                )
            if getattr(actual_distance, "value", actual_distance) != "Cosine":
                raise VectorIndexError(
                    f"Collection {self.collection_name!r} must use cosine distance"
                )

        # Qdrant Cloud requires payload indexes before filtering on these fields.
        for field_name, field_schema in (
            ("workspace_id", models.PayloadSchemaType.KEYWORD),
            ("paper_id", models.PayloadSchemaType.KEYWORD),
            ("section", models.PayloadSchemaType.KEYWORD),
            ("content_type", models.PayloadSchemaType.KEYWORD),
            ("page_start", models.PayloadSchemaType.INTEGER),
            ("page_end", models.PayloadSchemaType.INTEGER),
        ):
            self.client.create_payload_index(
                collection_name=self.collection_name,
                field_name=field_name,
                field_schema=field_schema,
                wait=True,
            )

    @staticmethod
    def _payload(item: EmbeddedChunk) -> dict[str, str | int]:
        chunk = item.chunk
        return {
            "chunk_id": chunk.chunk_id,
            "workspace_id": chunk.workspace_id,
            "paper_id": chunk.paper_id,
            "paper_title": chunk.paper_title,
            "text": chunk.text,
            "page_start": chunk.page_start,
            "page_end": chunk.page_end,
            "section": chunk.section,
            "content_type": chunk.content_type,
            "chunk_index": chunk.chunk_index,
            "content_hash": chunk.content_hash,
        }
