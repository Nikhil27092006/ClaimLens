from app.pipeline.decomposition import decompose_query


def test_decomposition_is_bounded() -> None:
    assert len(decompose_query("one?two?three", max_subqueries=2)) == 2