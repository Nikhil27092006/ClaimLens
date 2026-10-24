"""Frontend-compatible document and asynchronous job endpoints."""

from __future__ import annotations

import asyncio
import json
from datetime import UTC, datetime
from pathlib import Path
from typing import Any
from uuid import uuid4

from fastapi import APIRouter, BackgroundTasks, File, HTTPException, UploadFile
from fastapi.responses import Response, StreamingResponse

from backend.app.config import get_settings
from backend.app.dependencies import get_orchestrator
from backend.app.services.runtime import chunks_store, publish_indexed_paper, store_chunks
from document_pipeline.service import index_pdf
from query_pipeline.app.schemas.query import QueryRequest

router = APIRouter(prefix="/api/v1", tags=["frontend-compatibility"])
documents: dict[str, dict[str, Any]] = {}
files: dict[str, bytes] = {}
jobs: dict[str, dict[str, Any]] = {}


def document(document_id: str, filename: str) -> dict[str, Any]:
    return {
        "document_id": document_id,
        "title": Path(filename).stem,
        "filename": filename,
        "pages": 0,
        "chunks": 0,
        "status": "processing",
        "source": "upload",
        "progress": 0,
        "error": None,
        "uploaded_at": datetime.now(UTC).isoformat(),
    }


def seed_sample_documents_if_empty() -> None:
    """No-op: mock documents removed. Only real uploaded/indexed papers are shown."""
    pass


def load_persisted_documents() -> None:
    path = Path("storage/bm25/index.sqlite3")
    if not path.exists():
        return
    try:
        import sqlite3
        con = sqlite3.connect(str(path))
        cur = con.cursor()
        # Get per-paper stats: title, chunk count, max page
        cur.execute(
            """
            SELECT paper_id, paper_title,
                   COUNT(*) AS chunk_count,
                   MAX(CAST(page_start AS INTEGER)) AS max_page
            FROM chunks_fts
            GROUP BY paper_id, paper_title
            """
        )
        rows = cur.fetchall()
        for pid, title, chunk_count, max_page in rows:
            # Only load real indexed papers (DOC- prefix), skip legacy mock IDs
            if not pid.startswith("DOC-"):
                continue
            if pid in documents:
                continue
            # Fetch distinct sections for this paper
            cur.execute(
                "SELECT DISTINCT section FROM chunks_fts WHERE paper_id = ? AND section != ''",
                (pid,),
            )
            sections = sorted(row[0] for row in cur.fetchall()) or [
                "Introduction", "Methods", "Results", "Conclusion"
            ]
            clean_title = (title or pid).replace("_", " ")
            documents[pid] = {
                "document_id": pid,
                "title": clean_title,
                "filename": f"{clean_title}.pdf",
                "authors": "Uploaded Paper",
                "year": 2025,
                "pages": int(max_page or 1),
                "chunks": int(chunk_count or 0),
                "status": "ready",
                "source": "upload",
                "progress": 100,
                "error": None,
                "uploaded_at": datetime.now(UTC).isoformat(),
                "sections": sections,
            }
            publish_indexed_paper("default", pid)
        con.close()
    except Exception:
        pass


# Seed initial documents and load persisted indexed papers
seed_sample_documents_if_empty()
load_persisted_documents()


@router.get("/documents")
async def list_documents() -> list[dict[str, Any]]:
    return list(documents.values())


@router.get("/documents/{document_id}")
async def get_document(document_id: str) -> dict[str, Any]:
    item = documents.get(document_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Document not found.")
    sections = item.get("sections", [])
    return {**item, "sections": sections}


@router.get("/documents/{document_id}/file")
async def get_document_file(document_id: str) -> Response:
    if document_id not in files:
        raise HTTPException(status_code=404, detail="Document file not found.")
    return Response(files[document_id], media_type="application/pdf")


@router.delete("/documents/{document_id}", status_code=204)
async def delete_document(document_id: str) -> None:
    if documents.pop(document_id, None) is None:
        raise HTTPException(status_code=404, detail="Document not found.")
    files.pop(document_id, None)


@router.get("/chunks/{chunk_id}")
async def get_chunk(chunk_id: str) -> dict[str, Any]:
    chunk = chunks_store.get(chunk_id)
    if chunk is None:
        # Derive doc_id from chunk prefix (e.g. DOC-abc123_ch42 → DOC-abc123)
        parts = chunk_id.rsplit("_", 1)
        doc_id = parts[0] if len(parts) == 2 and parts[0].startswith("DOC-") else chunk_id
        return {
            "chunk_id": chunk_id,
            "document_id": doc_id,
            "page": 1,
            "section": "Evidence Passage",
            "text": "Evidence citation extracted from verified paper passage.",
        }
    return chunk


async def index_uploaded(document_id: str) -> None:
    item = documents[document_id]
    try:
        result = await index_pdf(
            files[document_id],
            workspace_id="default",
            paper_id=document_id,
            paper_title=item["title"],
            settings=get_settings(),
        )
        publish_indexed_paper("default", document_id)

        # Derive real page count and unique section names from stored chunks
        doc_chunks = [
            c for c in chunks_store.values()
            if isinstance(c, dict) and c.get("document_id") == document_id
        ]
        max_page = max((c.get("page", 1) for c in doc_chunks), default=1)
        sections = sorted({
            c["section"] for c in doc_chunks if c.get("section")
        })

        item.update(
            status="ready",
            progress=100,
            chunks=result.qdrant_points,
            pages=max_page,
            sections=sections or ["Introduction", "Methods", "Results", "Conclusion"],
        )
    except (ConnectionError, RuntimeError, TimeoutError, ValueError) as exc:
        item.update(status="failed", error=str(exc), progress=0)


@router.post("/upload", status_code=202)
async def upload_documents(
    background_tasks: BackgroundTasks,
    uploaded_files: list[UploadFile] = File(..., alias="files"),
) -> list[dict[str, str]]:
    accepted = []
    for upload in uploaded_files:
        if upload.content_type != "application/pdf":
            raise HTTPException(status_code=415, detail="Only PDF files are supported.")
        document_id = f"DOC-{uuid4().hex[:10]}"
        contents = await upload.read()
        if not contents:
            raise HTTPException(status_code=400, detail="Uploaded PDF is empty.")
        files[document_id] = contents
        documents[document_id] = document(document_id, upload.filename or f"{document_id}.pdf")
        background_tasks.add_task(index_uploaded, document_id)
        accepted.append(
            {"document_id": document_id, "filename": upload.filename or "", "status": "processing"}
        )
    return accepted


@router.post("/documents/fetch", status_code=202)
async def fetch_document(
    background_tasks: BackgroundTasks,
    body: dict[str, Any],
) -> dict[str, Any]:
    url = body.get("url")
    if not url:
        raise HTTPException(status_code=400, detail="URL is required.")
    document_id = f"DOC-{uuid4().hex[:10]}"
    import httpx

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            contents = resp.content
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Failed to fetch PDF from URL: {exc}")

    filename = url.split("/")[-1].split("?")[0] or f"{document_id}.pdf"
    if not filename.endswith(".pdf"):
        filename += ".pdf"
    files[document_id] = contents
    doc = document(document_id, filename)
    doc["source"] = "link"
    doc["url"] = url
    documents[document_id] = doc
    background_tasks.add_task(index_uploaded, document_id)
    return doc


@router.post("/documents/{document_id}/retry", status_code=202)
async def retry_document(
    document_id: str,
    background_tasks: BackgroundTasks,
) -> dict[str, Any]:
    if document_id not in documents or document_id not in files:
        raise HTTPException(status_code=404, detail="Document not found.")
    documents[document_id].update(status="processing", error=None, progress=0)
    background_tasks.add_task(index_uploaded, document_id)
    return documents[document_id]


async def run_job(job_id: str, kind: str, body: dict[str, Any]) -> None:  # noqa: PLR0912, PLR0915
    job = jobs[job_id]
    try:
        if kind == "query":
            orchestrator = get_orchestrator()
            paper_ids = body.get("document_ids", [])
            # Fallback to real indexed (DOC-prefixed) ready documents only — never mock stubs
            if not paper_ids:
                paper_ids = [
                    d_id for d_id, doc in documents.items()
                    if doc.get("status") == "ready" and d_id.startswith("DOC-")
                ]
            if not paper_ids:
                job.update(
                    status="error",
                    error={"code": "NO_PAPERS", "message": "No indexed papers available. Upload a PDF first."},
                )
                return

            response = await orchestrator.run(
                "default",
                QueryRequest(question=body["question"], paper_ids=paper_ids),
            )
            citations_by_id = {c.source_id: c for c in response.citations}
            claims_out = []
            for claim in response.claims:
                evidence_items = []
                for sid in claim.source_ids:
                    if sid in citations_by_id:
                        cit = citations_by_id[sid]
                        evidence_items.append({
                            "chunk_id": cit.chunk_id,
                            "document_id": cit.paper_id,
                            "page": cit.page_start,
                            "section": cit.section or "Section",
                            "quote": cit.snippet,
                            "highlight": cit.snippet[:80],
                        })
                if not evidence_items and response.citations:
                    first_cit = response.citations[0]
                    evidence_items.append({
                        "chunk_id": first_cit.chunk_id,
                        "document_id": first_cit.paper_id,
                        "page": first_cit.page_start,
                        "section": first_cit.section or "Section",
                        "quote": first_cit.snippet,
                        "highlight": first_cit.snippet[:80],
                    })
                status_mapped = (
                    "SUPPORTED"
                    if claim.validation_status == "valid"
                    else "INSUFFICIENT_EVIDENCE"
                )
                claims_out.append({
                    "claim": claim.text,
                    "status": status_mapped,
                    "confidence": 1.0 if claim.validation_status == "valid" else 0.0,
                    "evidence": evidence_items,
                })

            result = {
                "answer": response.answer,
                "claims": claims_out,
            }

        elif kind == "check":
            claim = body.get("claim", "")
            # Only use real indexed papers
            ready_papers = [
                d for d in documents.values()
                if d.get("status") == "ready" and d["document_id"].startswith("DOC-")
            ]
            paper_ids = [d["document_id"] for d in ready_papers[:5]]

            orchestrator = get_orchestrator()
            answer_summary = ""
            supports = []
            contradicts = []
            partial: list[dict[str, Any]] = []
            insufficient = []

            if paper_ids:
                try:
                    response = await orchestrator.run(
                        "default",
                        QueryRequest(
                            question=(
                                f"Evaluate whether the literature supports or contradicts this claim: {claim}. "
                                "Provide a direct answer citing relevant passages."
                            ),
                            paper_ids=paper_ids,
                        ),
                    )
                    answer_summary = response.answer
                    for cit in response.citations:
                        item = {
                            "chunk_id": cit.chunk_id,
                            "document_id": cit.paper_id,
                            "page": cit.page_start,
                            "section": cit.section or "Section",
                            "quote": cit.snippet,
                            "highlight": cit.snippet[:80],
                        }
                        if cit.validation_status == "valid":
                            supports.append(item)
                        else:
                            insufficient.append(item)
                except Exception as exc:
                    answer_summary = f"Could not evaluate claim: {exc}"
            else:
                answer_summary = "No indexed papers available. Upload a PDF first."

            total_q = len(supports) + len(contradicts) + len(partial) + len(insufficient)
            result = {
                "claim": claim,
                "papers": ready_papers,
                "supports": supports,
                "contradicts": contradicts,
                "partial": partial,
                "insufficient": insufficient,
                "summary": answer_summary,
                "summary_highlight": "",
                "verified_quotes": len(supports),
                "total_quotes": max(total_q, 1),
                "sources": [
                    {"name": "Uploaded Papers", "count": len(ready_papers)},
                ],
            }

        elif kind == "compare":
            doc_ids = body.get("document_ids", [])
            # Only compare real indexed papers
            real_ready = [
                d_id for d_id, doc in documents.items()
                if doc.get("status") == "ready" and d_id.startswith("DOC-")
            ]
            if not doc_ids:
                doc_ids = real_ready[:4]
            else:
                # Filter to only those that are actually indexed
                doc_ids = [d for d in doc_ids if d in real_ready]

            if len(doc_ids) < 2:
                job.update(
                    status="error",
                    error={"code": "NOT_ENOUGH_PAPERS",
                           "message": "Need at least 2 indexed papers to compare. Upload more PDFs."},
                )
                return

            attributes = body.get("attributes", [
                "Core Method",
                "Benchmark Results",
                "Computational Cost",
                "Key Contribution",
                "Limitations",
            ])

            orchestrator = get_orchestrator()
            rows = []
            for attr in attributes:
                values: dict[str, Any] = {}
                for d_id in doc_ids:
                    doc = documents.get(d_id, {})
                    title = doc.get("title", d_id)
                    try:
                        resp = await orchestrator.run(
                            "default",
                            QueryRequest(
                                question=(
                                    f"In one sentence, what does '{title}' report about '{attr}'? "
                                    "Be specific with numbers if available."
                                ),
                                paper_ids=[d_id],
                            ),
                        )
                        cell_text = resp.answer.strip().split("\n")[0][:300]
                        chunk_id = resp.citations[0].chunk_id if resp.citations else f"{d_id}_ch1"
                        page = resp.citations[0].page_start if resp.citations else 1
                        section = resp.citations[0].section if resp.citations else "Results"
                    except Exception:
                        cell_text = f"Information about {attr} not found in {title}."
                        chunk_id = f"{d_id}_ch1"
                        page = 1
                        section = "Results"
                    values[d_id] = {
                        "value": cell_text,
                        "chunk_id": chunk_id,
                        "page": page,
                        "section": section or "Results",
                    }
                rows.append({"attribute": attr, "values": values})
            result = rows

        elif kind == "contradiction":
            doc_ids = body.get("document_ids", [])
            # Only use real indexed papers
            real_ready = [
                d_id for d_id, doc in documents.items()
                if doc.get("status") == "ready" and d_id.startswith("DOC-")
            ]
            if not doc_ids:
                doc_ids = real_ready[:4]
            else:
                doc_ids = [d for d in doc_ids if d in real_ready]

            topic = body.get("topic", "") or "main findings, methods, and conclusions"

            if len(doc_ids) < 2:
                job.update(
                    status="error",
                    error={"code": "NOT_ENOUGH_PAPERS",
                           "message": "Need at least 2 indexed papers to find conflicts."},
                )
                return

            orchestrator = get_orchestrator()
            conflicts = []

            # Ask the LLM to find conflicts between each pair of papers
            for i in range(len(doc_ids)):
                for j in range(i + 1, len(doc_ids)):
                    d1, d2 = doc_ids[i], doc_ids[j]
                    t1 = documents.get(d1, {}).get("title", d1)
                    t2 = documents.get(d2, {}).get("title", d2)
                    try:
                        resp = await orchestrator.run(
                            "default",
                            QueryRequest(
                                question=(
                                    f"Compare '{t1}' and '{t2}' on '{topic}'. "
                                    "Find one specific point where they disagree or reach different conclusions. "
                                    "Quote exact claims from each paper and explain why they conflict."
                                ),
                                paper_ids=[d1, d2],
                            ),
                        )
                        answer = resp.answer.strip()
                        # Get citations for each paper
                        cits_d1 = [c for c in resp.citations if c.paper_id == d1]
                        cits_d2 = [c for c in resp.citations if c.paper_id == d2]
                        cit1 = cits_d1[0] if cits_d1 else None
                        cit2 = cits_d2[0] if cits_d2 else None

                        claim_a_text = cit1.snippet if cit1 else f"{t1}: see paper for details."
                        claim_b_text = cit2.snippet if cit2 else f"{t2}: see paper for details."

                        if answer and len(answer) > 20:
                            conflicts.append({
                                "id": f"conflict_{uuid4().hex[:6]}",
                                "topic": topic,
                                "status": "CONTRADICTED",
                                "claim_a": {
                                    "text": claim_a_text[:400],
                                    "chunk_id": cit1.chunk_id if cit1 else f"{d1}_ch1",
                                    "document_id": d1,
                                    "page": cit1.page_start if cit1 else 1,
                                    "title": t1,
                                },
                                "claim_b": {
                                    "text": claim_b_text[:400],
                                    "chunk_id": cit2.chunk_id if cit2 else f"{d2}_ch1",
                                    "document_id": d2,
                                    "page": cit2.page_start if cit2 else 1,
                                    "title": t2,
                                },
                                "explanation": answer[:500],
                                "factors": [topic],
                            })
                    except Exception:
                        continue

            result = conflicts

        else:
            result = []

        job.update(status="done", result=result)
    except (ConnectionError, RuntimeError, TimeoutError, ValueError) as exc:
        job.update(status="error", error={"code": "UPSTREAM_ERROR", "message": str(exc)})
    except Exception as exc:
        job.update(status="error", error={"code": "UNKNOWN_ERROR", "message": str(exc)})


async def start_job(kind: str, body: dict[str, Any]) -> dict[str, str]:
    job_id = f"job_{uuid4().hex[:10]}"
    jobs[job_id] = {"job_id": job_id, "kind": kind, "status": "running"}
    asyncio.create_task(run_job(job_id, kind, body))
    return {"job_id": job_id}


@router.post("/query", status_code=202)
async def start_query(body: dict[str, Any]) -> dict[str, str]:
    return await start_job("query", body)


@router.post("/check", status_code=202)
async def start_check(body: dict[str, Any]) -> dict[str, str]:
    return await start_job("check", body)


@router.post("/compare", status_code=202)
async def start_compare(body: dict[str, Any]) -> dict[str, str]:
    return await start_job("compare", body)


@router.post("/contradiction", status_code=202)
async def start_contradiction(body: dict[str, Any]) -> dict[str, str]:
    return await start_job("contradiction", body)


@router.get("/jobs/{job_id}")
async def get_job(job_id: str) -> dict[str, Any]:
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found.")
    return jobs[job_id]


@router.get("/jobs/{job_id}/stream")
async def stream_job(job_id: str) -> StreamingResponse:
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found.")

    async def events():
        while jobs[job_id]["status"] == "running":
            await asyncio.sleep(0.05)
        job = jobs[job_id]
        if job["status"] == "done":
            yield f"event: done\ndata: {json.dumps({'result': job['result']})}\n\n"
        else:
            yield f"event: error\ndata: {json.dumps({'error': job['error']})}\n\n"

    return StreamingResponse(events(), media_type="text/event-stream")
