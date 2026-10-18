from typing import Literal

QueryType = Literal[
    "single_paper",
    "multi_paper_comparison",
    "dataset",
    "methodology",
    "results",
    "limitations",
    "contradiction",
    "similarity",
    "general",
]


def classify_question(question: str, paper_count: int) -> QueryType:
    text = question.lower()
    if any(word in text for word in ("compare", "higher", "lower", "versus", " vs ")):
        return "multi_paper_comparison" if paper_count > 1 else "general"
    if any(word in text for word in ("dataset", "data set", "corpus")):
        return "dataset"
    if any(word in text for word in ("limitation", "weakness", "future work")):
        return "limitations"
    if any(word in text for word in ("method", "architecture", "approach", "model")):
        return "methodology"
    if any(word in text for word in ("result", "score", "accuracy", "f1", "metric")):
        return "results"
    return "single_paper" if paper_count == 1 else "general"