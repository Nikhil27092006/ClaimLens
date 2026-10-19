// In-memory state behind the mock API. Reset on every page load (and between tests).

import type { ApiErrorBody, Document, JobKind, JobStep } from '@/api/types';
import { LIBRARY_IDS } from './fixtures';
import { PAPERS } from './papers';
import { mockSettings, scaledDelay } from './settings';

interface Processing {
  startedAt: number;
  from: number;
  durationMs: number;
}

interface StoredDocument {
  doc: Document;
  /** Shown by GET /documents; check-only papers are not. */
  inLibrary: boolean;
  processing?: Processing;
  /** Bytes of a PDF uploaded in this session, served back by /file. */
  file?: ArrayBuffer;
  sections: string[];
}

export interface MockJob {
  id: string;
  kind: JobKind;
  steps: JobStep[];
  stepDelays: number[];
  result: unknown;
  /** Index of the step after which the job fails (when ?mock=error). */
  failAfter?: number;
  createdAt: number;
}

export const JOB_ERROR: ApiErrorBody = {
  code: 'UPSTREAM_ERROR',
  message: 'Semantic Scholar did not respond. The steps completed so far are kept.',
};

// 300–900 ms per step, as the build prompt asks.
const STEP_DELAYS = [450, 800, 550, 700, 900, 750, 650, 500];

const minutesAgo = (now: number, minutes: number) => new Date(now - minutes * 60_000).toISOString();

function initialDocuments(now: number): Map<string, StoredDocument> {
  const docs = new Map<string, StoredDocument>();
  for (const paper of PAPERS) {
    const { sections, ...meta } = paper;
    const id = paper.document_id;
    const stored: StoredDocument = {
      doc: { ...meta, status: 'ready', uploaded_at: minutesAgo(now, 12) },
      inLibrary: LIBRARY_IDS.includes(id),
      sections: sections.map((s) => s.head),
    };
    if (id === 'DOC003') stored.doc.uploaded_at = minutesAgo(now, 4);
    if (id === 'DOC004') {
      stored.doc = {
        ...stored.doc,
        status: 'processing',
        progress: 62,
        uploaded_at: minutesAgo(now, 0),
      };
      stored.processing = { startedAt: now, from: 62, durationMs: 14_000 };
    }
    if (id === 'DOC005') {
      stored.doc = {
        ...stored.doc,
        status: 'failed',
        chunks: undefined,
        error: 'No text layer found. The PDF looks scanned.',
        uploaded_at: minutesAgo(now, 2),
      };
    }
    docs.set(id, stored);
  }
  return docs;
}

function createDb() {
  const now = Date.now();
  return {
    documents: initialDocuments(now),
    jobs: new Map<string, MockJob>(),
    // The first job is #0042, as on the Claim check artboard.
    nextJob: 42,
    nextDocument: 7,
  };
}

export let db = createDb();

export function resetDb(): void {
  db = createDb();
}

/** Advances processing documents to their current progress, finishing them when due. */
export function currentDocument(stored: StoredDocument, now = Date.now()): Document {
  const { processing } = stored;
  if (stored.doc.status === 'processing' && processing) {
    const elapsed = now - processing.startedAt;
    const duration = scaledDelay(processing.durationMs);
    if (duration === 0 || elapsed >= duration) {
      stored.doc = {
        ...stored.doc,
        status: 'ready',
        progress: undefined,
        error: null,
        chunks: stored.doc.chunks ?? stored.doc.pages * 7,
      };
      stored.processing = undefined;
    } else {
      const progress = processing.from + ((100 - processing.from) * elapsed) / duration;
      stored.doc = { ...stored.doc, progress: Math.min(99, Math.round(progress)) };
    }
  }
  return stored.doc;
}

export function startProcessing(stored: StoredDocument, durationMs = 6_000): void {
  stored.doc = { ...stored.doc, status: 'processing', progress: 0, error: null };
  stored.processing = { startedAt: Date.now(), from: 0, durationMs };
}

export function addDocument(doc: Document, file?: ArrayBuffer): StoredDocument {
  const stored: StoredDocument = { doc, inLibrary: true, file, sections: [] };
  db.documents.set(doc.document_id, stored);
  startProcessing(stored);
  return stored;
}

export function nextDocumentId(): string {
  return `DOC${String(db.nextDocument++).padStart(3, '0')}`;
}

export function createJob(kind: JobKind, steps: JobStep[], result: unknown): MockJob {
  const id = `job_${String(db.nextJob++).padStart(4, '0')}`;
  const job: MockJob = {
    id,
    kind,
    steps,
    stepDelays: steps.map((_, i) => STEP_DELAYS[i % STEP_DELAYS.length] ?? 600),
    result,
    failAfter: mockSettings.failJobs ? Math.min(3, steps.length - 1) : undefined,
    createdAt: Date.now(),
  };
  db.jobs.set(id, job);
  return job;
}

/** Total time a job takes to stream, including the final `done`. */
export function jobDuration(job: MockJob): number {
  const steps =
    job.failAfter === undefined ? job.stepDelays : job.stepDelays.slice(0, job.failAfter + 1);
  return steps.reduce((sum, ms) => sum + scaledDelay(ms), 0) + scaledDelay(300);
}
