from app.providers.nemotron_provider import GenerationProvider
from app.schemas.generation import GeneratedAnswer
from app.schemas.retrieval import EvidenceSource


def evidence_text(evidence: list[EvidenceSource]) -> str:
    return "\n".join(
        f"[{item.source_id}] {item.candidate.text}"
        for item in evidence
    )


class PromptedGenerator:
    def __init__(self, provider: GenerationProvider) -> None:
        self.provider = provider

    async def generate(
        self, question: str, evidence: list[EvidenceSource]
    ) -> GeneratedAnswer:
        return await self.provider.generate(question, evidence)