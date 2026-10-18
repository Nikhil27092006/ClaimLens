# API contract

## Query

`POST /api/v1/workspaces/{workspace_id}/query`

```json
{
  "question": "What F1-score did the model achieve?",
  "paper_ids": ["paper-1"],
  "conversation_id": null,
  "filters": {
    "sections": ["Results"],
    "page_start": null,
    "page_end": null,
    "content_types": []
  }
}
```

Every successful answer includes `claims`, `citations`, and `pipeline_status`.
If no ready indexed evidence exists, the service returns
`pipeline_status: "no_ready_papers"` or `"insufficient_evidence"` and does not
call generation.