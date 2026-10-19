# Ingestion contract

The query service consumes only indexed chunks from papers whose status is
`ready`. Required chunk payload:

```json
{
  "chunk_id": "chunk_024",
  "workspace_id": "workspace_001",
  "paper_id": "paper_001",
  "paper_title": "Paper A",
  "text": "The proposed model achieved an F1-score of 0.91.",
  "page_start": 7,
  "page_end": 7,
  "section": "Results",
  "content_type": "text",
  "chunk_index": 24,
  "content_hash": "a93f..."
}
```

The ingestion service must preserve exact text and all IDs/metadata. Retrieval
must always filter by `workspace_id` and selected `paper_id` values.

## Index conventions

- Pages are one-based and `page_start`/`page_end` are inclusive. For a
  single-page chunk, both values are identical.
- The Qdrant collection name is configured by `QDRANT_COLLECTION` and defaults
  to `paper_chunks`.
- Dense vectors use the configured embedding model and dimension
  (`EMBEDDING_MODEL` and `EMBEDDING_DIMENSION`). Ingestion and query services
  must use the same values. The collection distance must be cosine.
- Qdrant point IDs may be UUIDs, but `payload.chunk_id` is the canonical ID
  returned to the query service. Required payload keys are the fields in the
  example above.
- The sparse/BM25 index must return the same `chunk_id`, `workspace_id`, and
  `paper_id` values as Qdrant. Its document text must be the exact `text`
  payload, and page/section metadata must be copied from the same chunk record.
- A paper is queryable only when its status is `ready` and every selected
  paper has at least one indexed chunk. Partial readiness must be reported to
  the caller rather than silently dropping a selected paper.
