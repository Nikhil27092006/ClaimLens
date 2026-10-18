import pytest
from pydantic import ValidationError

from query_pipeline.app.schemas.query import QueryRequest


def test_query_request_rejects_duplicate_papers() -> None:
    with pytest.raises(ValidationError, match="duplicates"):
        QueryRequest(question="Question", paper_ids=["p1", "p1"])


def test_query_request_rejects_reversed_page_range() -> None:
    with pytest.raises(ValidationError, match="page_start"):
        QueryRequest(
            question="Question",
            paper_ids=["p1"],
            filters={"page_start": 4, "page_end": 2},
        )
