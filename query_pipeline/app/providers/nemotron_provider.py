from typing import Protocol

from query_pipeline.app.generation.parser import parse_generated_answer
from query_pipeline.app.schemas.generation import GeneratedAnswer
from query_pipeline.app.schemas.retrieval import EvidenceSource


class GenerationProvider(Protocol):
    async def generate(
        self, question: str, evidence: list[EvidenceSource]
    ) -> GeneratedAnswer:
        ...


class OpenAICompatibleGenerationProvider:
    def __init__(self, base_url: str, api_key: str, model: str) -> None:
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.model = model

    async def generate(self, question, evidence):
        import httpx
        evidence_text = "\n".join(
            f"[{item.source_id}] {item.candidate.text}" for item in evidence
        )
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json={
                    "model": self.model,
                    "temperature": 0.1,
                    "response_format": {"type": "json_object"},
                    "messages": [
                        {"role": "system", "content": (
                            "Answer only from supplied evidence. Every factual "
                            "claim must cite a supplied source ID. Return JSON."
                        )},
                        {"role": "user", "content": (
                            f"Question: {question}\nEvidence:\n{evidence_text}"
                        )},
                    ],
                },
            )
            response.raise_for_status()
        return parse_generated_answer(response.json()["choices"][0]["message"]["content"])
