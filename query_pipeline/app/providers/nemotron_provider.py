from typing import Protocol

from openai import AsyncOpenAI

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
        self.client = AsyncOpenAI(base_url=self.base_url, api_key=self.api_key)

    async def generate(
        self, question: str, evidence: list[EvidenceSource]
    ) -> GeneratedAnswer:
        evidence_text = "\n".join(
            f"[{item.source_id}] {item.candidate.text}" for item in evidence
        )
        fallback_source_ids = [item.source_id for item in evidence] or ["S1"]
        try:
            completion = await self.client.chat.completions.create(
                model=self.model,
                temperature=0.1,
                top_p=0.95,
                max_tokens=16384,
                extra_body={"chat_template_kwargs": {"enable_thinking": True}},
                stream=True,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "Answer only from supplied evidence. Every factual "
                            "claim must cite a supplied source ID. Return only "
                            "a JSON object with keys: answer (string), claims (array of objects "
                            "with text, source_ids (e.g. [\"S1\"]), claim_type ('fact'), confidence (1.0)), "
                            "and uncertainties (array of strings)."
                        ),
                    },
                    {
                        "role": "user",
                        "content": f"Question: {question}\nEvidence:\n{evidence_text}",
                    },
                ],
            )
            content_chunks: list[str] = []
            async for chunk in completion:
                if not chunk.choices:
                    continue
                content = chunk.choices[0].delta.content
                if content is not None:
                    content_chunks.append(content)
            content = "".join(content_chunks)
        except Exception as exc:
            raise ConnectionError("Nemotron generation request failed") from exc

        if not content.strip():
            raise ValueError("Generation provider returned an empty response")
        return parse_generated_answer(content, fallback_source_ids=fallback_source_ids)

