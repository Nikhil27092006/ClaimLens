from typing import Protocol


class PaperRepository(Protocol):
    async def ready_papers(
        self, workspace_id: str, paper_ids: list[str]
    ) -> set[str]:
        ...


class InMemoryPaperRepository:
    def __init__(self, ready_by_workspace: dict[str, set[str]]) -> None:
        self.ready_by_workspace = ready_by_workspace

    async def ready_papers(
        self, workspace_id: str, paper_ids: list[str]
    ) -> set[str]:
        ready = self.ready_by_workspace.get(workspace_id, set())
        return ready.intersection(paper_ids)