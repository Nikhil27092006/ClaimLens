# Ingestion contract

The query service expects each indexed chunk to preserve:

- `chunk_id`
- `workspace_id`
- `paper_id`
- `paper_title`
- `text`
- `page_start` and `page_end`
- optional `section`, `content_type`, and `content_hash`

Retrieval providers must apply workspace and selected-paper filters before
returning candidates.