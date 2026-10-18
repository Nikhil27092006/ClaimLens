# ResearchLens Query Service

ResearchLens is an evidence-grounded research-paper question-answering
backend.

## Responsibilities

This service owns:

- Query validation.
- Query classification.
- Query rewriting.
- Query decomposition.
- Dense retrieval.
- Sparse retrieval.
- Hybrid fusion.
- Reranking.
- Evidence selection.
- Nemotron generation.
- Citation validation.
- Guardrails.

It does not own frontend or PDF ingestion.

## Run locally

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
# ResearchLens Query Service

Evidence-first RAG query service for research papers.

## MVP

The current MVP exposes:

- `GET /health`
- `POST /api/v1/workspaces/{workspace_id}/query`

The pipeline validates ready papers and indexed chunks, embeds the question,
retrieves workspace-scoped candidates, deduplicates evidence, assigns controlled
source IDs, generates a structured answer, and maps citations back to page
metadata. External providers are represented by protocols so they can be
replaced without changing orchestration.

The default dependency wiring intentionally uses empty fake providers. Connect
ingestion-backed repositories and real model providers before deploying.

## Run

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
pytest
```

Never commit `.env` or API keys. Copy `.env.example` to `.env` and supply
secrets through the runtime environment.
