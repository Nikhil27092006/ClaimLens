# Query pipeline

1. Validate the question, selected papers, ready status, and indexed chunks.
2. Generate a query embedding.
3. Retrieve dense candidates with workspace and paper filters.
4. Optionally retrieve sparse BM25 candidates and apply reciprocal-rank fusion.
5. Deduplicate by chunk ID and content hash.
6. Optionally rerank candidates.
7. Assign controlled source IDs (`S1`, `S2`, ...).
8. Generate a structured answer from evidence only.
9. Validate source IDs and render page-level citations.

No generation call is made when no ready evidence exists.