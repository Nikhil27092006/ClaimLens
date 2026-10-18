from fastapi import APIRouter, Depends

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
    return await orchestrator.run(workspace_id, request)