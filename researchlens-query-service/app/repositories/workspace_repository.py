from typing import Protocol


class WorkspaceRepository(Protocol):
    async def user_has_access(self, user_id: str, workspace_id: str) -> bool:
        ...


class InMemoryWorkspaceRepository:
    def __init__(self, memberships: set[tuple[str, str]]) -> None:
        self.memberships = memberships

    async def user_has_access(self, user_id: str, workspace_id: str) -> bool:
        return (user_id, workspace_id) in self.memberships