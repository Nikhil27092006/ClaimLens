from fastapi import APIRouter, Depends, HTTPException

from app.dependencies import get_orchestrator
from app.pipeline.orchestrator import QueryOrchestrator
from app.schemas.query import QueryRequest, QueryResponse

router = APIRouter(
    prefix="/api/v1/workspaces/{workspace_id}",
    tags=["queries"],
)


@router.post("/query", response_model=QueryResponse)
async def query_workspace(
    workspace_id: str,
    request: QueryRequest,
    orchestrator: QueryOrchestrator = Depends(get_orchestrator),
) -> QueryResponse:
    try:
        return await orchestrator.run(workspace_id, request)
    except (TimeoutError, ConnectionError) as exc:
        raise HTTPException(
            status_code=503, detail="A query provider is unavailable"
        ) from exc