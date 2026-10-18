# ResearchLens Query Service

Evidence-first RAG query pipeline for research papers. The service is
independent of ingestion through provider and repository interfaces.

## Run without ingestion

```bash
cd query_pipeline
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pytest -q
uvicorn backend.app.main:app --reload
```

The fake-provider tests prove the complete pipeline without Qdrant, BM25, or
model credentials. Real ingestion adapters are connected only after the
contract in `docs/ingestion-contract.md` is implemented.

Never commit `.env`. Copy `.env.example` for a safe local configuration.

## API

`POST /api/v1/workspaces/{workspace_id}/query`

The response contains the generated answer, claims, server-generated citations,
uncertainties, and an explicit pipeline status.
