from fastapi import APIRouter, Depends, Header, HTTPException

from backend.app.dependencies import get_orchestrator
from query_pipeline.app.pipeline.orchestrator import QueryOrchestrator
from query_pipeline.app.schemas.query import QueryRequest, QueryResponse

router = APIRouter(
    prefix="/api/v1/workspaces/{workspace_id}",
    tags=["queries"],
)


@router.post("/query", response_model=QueryResponse)
async def query_workspace(
    workspace_id: str,
    request: QueryRequest,
    x_user_id: str | None = Header(default=None),
    orchestrator: QueryOrchestrator = Depends(get_orchestrator),
) -> QueryResponse:
    try:
        return await orchestrator.run(workspace_id, request, user_id=x_user_id)
    except (TimeoutError, ConnectionError) as exc:
        raise HTTPException(
            status_code=503, detail="A query provider is unavailable"
        ) from exc
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc