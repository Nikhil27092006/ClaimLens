from app.pipeline.classification import classify_question


def test_classifies_comparison() -> None:
    assert classify_question("Which paper has the higher score?", 2) == (
        "multi_paper_comparison"
    )