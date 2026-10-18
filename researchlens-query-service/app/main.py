from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.api.routes.health import router as health_router
from app.api.routes.queries import router as query_router
from app.config import get_settings
from app.observability.logging import configure_logging

app = FastAPI(title="ResearchLens Query Service", version="0.1.0")
configure_logging(get_settings().log_level)
app.include_router(health_router)
app.include_router(query_router)


@app.exception_handler(RequestValidationError)
async def request_validation_error(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    del request
    return JSONResponse(status_code=422, content={"detail": exc.errors()})


@app.exception_handler(ValueError)
async def value_error(request: Request, exc: ValueError) -> JSONResponse:
    del request
    return JSONResponse(status_code=400, content={"detail": str(exc)})