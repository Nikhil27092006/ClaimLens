"""Persistent lexical indexing with SQLite FTS5's BM25 ranking."""

import re
import sqlite3
from contextlib import closing
from dataclasses import dataclass
from pathlib import Path
from typing import Sequence

from document_pipeline.chunking.page_aware_chunker import IngestionChunk


@dataclass(frozen=True)
class BM25Hit:
    """A matching chunk and its SQLite FTS5 BM25 score (lower ranks higher)."""

    chunk: IngestionChunk
    score: float


class BM25Indexer:
    """Persist exact chunk text and metadata in a searchable SQLite FTS5 index."""

    def __init__(self, database_path: str | Path) -> None:
        self.database_path = Path(database_path)

    def upsert_chunks(self, chunks: Sequence[IngestionChunk]) -> int:
        """Insert or replace chunks by stable ID in one database transaction."""
        if not chunks:
            return 0
        self.database_path.parent.mkdir(parents=True, exist_ok=True)
        with closing(self._connect()) as connection:
            with connection:
                self._create_schema(connection)
                for chunk in chunks:
                    connection.execute(
                        "DELETE FROM chunks_fts WHERE chunk_id = ?",
                        (chunk.chunk_id,),
                    )
                    connection.execute(
                        """INSERT INTO chunks_fts (
                            chunk_id, workspace_id, paper_id, paper_title, text,
                            page_start, page_end, section, content_type, chunk_index,
                            content_hash
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                        self._values(chunk),
                    )
        return len(chunks)

    def search(
        self,
        query: str,
        *,
        workspace_id: str,
        paper_ids: Sequence[str],
        limit: int = 25,
        sections: Sequence[str] = (),
        page_start: int | None = None,
        page_end: int | None = None,
        content_types: Sequence[str] = (),
    ) -> tuple[BM25Hit, ...]:
        """Search by BM25 while enforcing workspace and selected-paper filters."""
        if limit < 1:
            raise ValueError("limit must be positive")
        if not workspace_id.strip():
            raise ValueError("workspace_id must not be empty")
        if not paper_ids:
            return ()
        if page_start is not None and page_start < 1:
            raise ValueError("page_start must be one-based")
        if page_end is not None and page_end < 1:
            raise ValueError("page_end must be one-based")
        if page_start is not None and page_end is not None and page_start > page_end:
            raise ValueError("page_start must not be greater than page_end")

        match_query = self._match_query(query)
        if not match_query or not self.database_path.exists():
            return ()

        clauses = [
            "chunks_fts MATCH ?",
            "workspace_id = ?",
            f"paper_id IN ({','.join('?' for _ in paper_ids)})",
        ]
        parameters: list[object] = [match_query, workspace_id, *paper_ids]
        if sections:
            clauses.append(f"section IN ({','.join('?' for _ in sections)})")
            parameters.extend(sections)
        if page_start is not None:
            clauses.append("page_end >= ?")
            parameters.append(page_start)
        if page_end is not None:
            clauses.append("page_start <= ?")
            parameters.append(page_end)
        if content_types:
            clauses.append(
                f"content_type IN ({','.join('?' for _ in content_types)})"
            )
            parameters.extend(content_types)
        parameters.append(limit)

        sql = f"""SELECT chunk_id, workspace_id, paper_id, paper_title, text,
                          page_start, page_end, section, content_type, chunk_index,
                          content_hash, bm25(chunks_fts) AS score
                   FROM chunks_fts
                   WHERE {' AND '.join(clauses)}
                   ORDER BY score ASC
                   LIMIT ?"""
        with closing(self._connect()) as connection:
            rows = connection.execute(sql, parameters).fetchall()
        return tuple(
            BM25Hit(
                chunk=IngestionChunk(
                    chunk_id=row[0],
                    workspace_id=row[1],
                    paper_id=row[2],
                    paper_title=row[3],
                    text=row[4],
                    page_start=row[5],
                    page_end=row[6],
                    section=row[7],
                    content_type=row[8],
                    chunk_index=row[9],
                    content_hash=row[10],
                ),
                score=float(row[11]),
            )
            for row in rows
        )

    def _connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self.database_path, timeout=30)
        connection.row_factory = None
        return connection

    @staticmethod
    def _create_schema(connection: sqlite3.Connection) -> None:
        connection.execute(
            """CREATE VIRTUAL TABLE IF NOT EXISTS chunks_fts USING fts5(
                chunk_id UNINDEXED,
                workspace_id UNINDEXED,
                paper_id UNINDEXED,
                paper_title UNINDEXED,
                text,
                page_start UNINDEXED,
                page_end UNINDEXED,
                section UNINDEXED,
                content_type UNINDEXED,
                chunk_index UNINDEXED,
                content_hash UNINDEXED
            )"""
        )

    @staticmethod
    def _values(chunk: IngestionChunk) -> tuple[object, ...]:
        return (
            chunk.chunk_id,
            chunk.workspace_id,
            chunk.paper_id,
            chunk.paper_title,
            chunk.text,
            chunk.page_start,
            chunk.page_end,
            chunk.section,
            chunk.content_type,
            chunk.chunk_index,
            chunk.content_hash,
        )

    @staticmethod
    def _match_query(query: str) -> str:
        terms = re.findall(r"[\w]+", query, flags=re.UNICODE)
        return " OR ".join(f'"{term}"' for term in terms)
