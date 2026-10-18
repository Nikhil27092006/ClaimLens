# API contract

`POST /api/v1/workspaces/{workspace_id}/query`

Request fields: `question`, `paper_ids`, optional `conversation_id`, and
optional `filters`. Response fields: `query_id`, `answer`, `claims`, `citations`,
`uncertainties`, and `pipeline_status`.
