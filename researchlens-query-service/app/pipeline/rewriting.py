def rewrite_query(question: str, context: str | None = None) -> str:
    if not context or not context.strip():
        return question.strip()
    return f"{question.strip()}\nContext: {context.strip()}"