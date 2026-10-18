from contextlib import asynccontextmanager
from collections.abc import AsyncIterator


@asynccontextmanager
async def pipeline_stage(name: str) -> AsyncIterator[None]:
    del name
    yield