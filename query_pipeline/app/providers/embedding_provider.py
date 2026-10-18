from typing import Protocol


class EmbeddingProvider(Protocol):
    async def embed(self, text: str) -> list[float]:
        ...


class OpenAICompatibleEmbeddingProvider:
    def __init__(self, base_url: str, api_key: str, model: str) -> None:
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.model = model

    async def embed(self, text: str) -> list[float]:
        import httpx

        if not text.strip():
            raise ValueError("Cannot embed empty text")
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                f"{self.base_url}/embeddings",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json={"model": self.model, "input": text},
            )
            response.raise_for_status()
        return [float(value) for value in response.json()["data"][0]["embedding"]]
