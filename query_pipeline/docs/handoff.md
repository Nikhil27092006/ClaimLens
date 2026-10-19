# Query pipeline handoff

## What is complete

The service contains a provider-independent query pipeline and a deterministic
fake-provider test path. It validates requests, restricts retrieval to the
workspace and selected papers, performs dense/sparse fusion, deduplication,
reranking, evidence balancing, context compression, controlled source IDs,
structured generation parsing, citation mapping, and relevance/claim checks.

Run:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pytest -q
```

## Ingestion integration still required

The ingestion owner must provide implementations for the repository/provider
protocols and preserve the payload in `ingestion-contract.md`. The final
integration must verify:

1. paper status is `ready`;
2. chunks have indexed vectors;
3. every candidate has matching workspace, paper, chunk, page, section, and
   text metadata;
4. the query embedding model and dimension match indexed vectors;
5. BM25 metadata maps to the same chunk IDs as dense retrieval.

No ingestion service or secret is required for the current test suite.

The detailed ingestion-owner checklist is available in
`docs/data-ingestion-owner-todo.pdf`.
