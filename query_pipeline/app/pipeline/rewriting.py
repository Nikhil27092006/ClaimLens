from pydantic import BaseModel


class RewriteResult(BaseModel):
    original_query: str
    rewritten_query: str
    was_rewritten: bool


def rewrite_query(question: str, context: str | None = None) -> str:
    question = question.strip()
    return f"{question}\nContext: {context.strip()}" if context and context.strip() else question
