from app.pipeline.rewriting import rewrite_query


def test_rewrite_preserves_question_and_context() -> None:
    assert rewrite_query("What about it?", "Paper A") == "What about it?\nContext: Paper A"