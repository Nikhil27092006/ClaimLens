from query_pipeline.app.providers.nemotron_provider import GenerationProvider
from query_pipeline.app.schemas.generation import GeneratedAnswer
from query_pipeline.app.schemas.retrieval import EvidenceSource


class Generator:
    def __init__(self, provider: GenerationProvider) -> None:
        self.provider = provider

    async def generate(self, question: str, evidence: list[EvidenceSource]) -> GeneratedAnswer:
        return await self.provider.generate(question, evidence)
