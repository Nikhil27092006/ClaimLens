# Document pipeline

## Ingest a PDF through chunk creation

Install the pipeline dependency from the repository root:

```bash
python -m pip install -r document_pipeline/requirements.txt
```

The ingestion function accepts a PDF path, PDF bytes, or a binary file-like
object. It extracts page text and PDF metadata, labels sections, and returns
page-aware chunks ready for embedding/indexing:

```python
from document_pipeline.ingestion import ingest_pdf

paper = ingest_pdf(
    "paper.pdf",
    workspace_id="workspace_001",
    paper_id="paper_001",
)
for chunk in paper.chunks:
    print(chunk.chunk_id, chunk.section, chunk.page_start, chunk.text)
```

The caller supplies workspace and paper IDs. The title comes from the caller,
embedded PDF metadata, the file name, or finally the paper ID. The pipeline does
not write to Qdrant/BM25 or mark a paper queryable; those steps happen after the
returned chunks have been embedded and stored successfully.

Native PDF text is kept without whitespace normalization. Section headings are
recognized from a conservative list of common academic headings. Chunks retain
one-based page numbers, section labels, stable IDs, and SHA-256 hashes of their
exact text. Chunk sizing uses whitespace-separated words as a dependency-free
proxy; it is not an exact count for a specific model tokenizer.

## Create embeddings

Pass the same async embedding provider used by the query pipeline. The service
embeds chunks with bounded concurrency, preserves their order, and checks every
vector against the configured Qdrant dimension:

```python
from document_pipeline.embeddings import embed_chunks
from query_pipeline.app.providers.embedding_provider import (
    OpenAICompatibleEmbeddingProvider,
)

provider = OpenAICompatibleEmbeddingProvider(
    base_url=embedding_base_url,
    api_key=embedding_api_key,
    model=embedding_model,
)
embedded_chunks = await embed_chunks(
    paper.chunks,
    provider,
    expected_dimension=embedding_dimension,
)
```

This returns chunk/vector pairs in memory. A provider error or dimension
mismatch is raised to the caller; vectors are never replaced with fake values.

## Run ingestion and embedding together

For a single entry point that returns both paper metadata/chunks and their
validated vectors, pass the same provider and dimension used by the query
pipeline:

```python
from document_pipeline import ingest_and_embed_pdf
from query_pipeline.app.providers.embedding_provider import (
    OpenAICompatibleEmbeddingProvider,
)

provider = OpenAICompatibleEmbeddingProvider(
    base_url=embedding_base_url,
    api_key=embedding_api_key,
    model=embedding_model,
)
prepared = await ingest_and_embed_pdf(
    "paper.pdf",
    workspace_id="workspace_001",
    paper_id="paper_001",
    embedding_provider=provider,
    expected_dimension=embedding_dimension,
)
print(len(prepared.paper.chunks), len(prepared.embedded_chunks))
```

The returned vectors remain in memory until the indexing step below writes them
to Qdrant and BM25. Do not mark the paper queryable until both writes succeed.

## Index prepared chunks

The indexers accept the same prepared records for both dense and lexical
search. Qdrant creates the configured cosine collection when needed and rejects
an existing collection with a different vector dimension. SQLite FTS5 stores
the exact text and payload metadata and ranks matches with BM25.

```python
from document_pipeline import index_prepared_paper
from document_pipeline.indexing import BM25Indexer, QdrantVectorIndexer

qdrant_indexer = QdrantVectorIndexer(
    qdrant_client,
    collection_name=qdrant_collection,
    vector_dimension=embedding_dimension,
)
bm25_indexer = BM25Indexer(bm25_database_path)
indexed = await index_prepared_paper(
    prepared,
    vector_indexer=qdrant_indexer,
    bm25_indexer=bm25_indexer,
)
print(indexed.qdrant_points, indexed.bm25_documents)
```

Both writes are idempotent by stable chunk ID. The indexers do not change paper
status; only mark the paper queryable after both indexing operations complete.
The BM25 database path should point to a SQLite file, such as
`storage/bm25/index.sqlite3`.

## Use the configured project services

For a real indexing run, set the rotated embedding and Qdrant credentials in
the project-root `.env`, then explicitly set `USE_FAKE_PROVIDERS=false`. The
configured helper below reads the same settings used by the backend, embeds
the chunks with the configured NVIDIA-compatible endpoint, and writes them to
Qdrant and SQLite BM25:

```python
import asyncio

from document_pipeline import index_pdf

result = asyncio.run(
    index_pdf(
        "paper.pdf",
        workspace_id="workspace_001",
        paper_id="paper_001",
        ocr_dpi=600,  # optional; default is 300
    )
)
print(result.qdrant_points, result.bm25_documents)
```

The helper raises a configuration error before making provider requests when
real providers are disabled or required embedding credentials are missing. It
does not update the paper repository's readiness state; the API layer should
do that only after this function succeeds.

OCR runs only for image-containing pages with little native text. It requires
the Tesseract executable and requested language data (English by default) to be
installed separately. If OCR is needed but unavailable, extraction raises
`OCRProcessingError` rather than silently returning empty text.
