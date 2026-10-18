def decompose_query(question: str, max_subqueries: int = 8) -> list[str]:
    if max_subqueries < 1:
        raise ValueError("max_subqueries must be positive")
    parts = [part.strip() for part in question.split("?") if part.strip()]
    return (parts or [question.strip()])[:max_subqueries]
