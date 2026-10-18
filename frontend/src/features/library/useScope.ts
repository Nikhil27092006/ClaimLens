import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDocuments } from '@/api/hooks';
import type { Document } from '@/api/types';
import { parseIds } from './format';

/** At most this many papers go into Ask, Compare or Conflicts when none are chosen. */
const DEFAULT_SCOPE = 5;

/**
 * The papers Ask, Compare and Conflicts work on, from ?docs=DOC001,DOC002. With no ?docs=,
 * the ready papers are written into the URL once, so later indexing does not change the scope
 * (and re-run a job) while the page is open.
 */
export function useScope() {
  const documents = useDocuments();
  const [params, setParams] = useSearchParams();
  const raw = params.get('docs');

  useEffect(() => {
    if (raw !== null || !documents.data) return;
    const ready = documents.data
      .filter((doc) => doc.status === 'ready')
      .slice(0, DEFAULT_SCOPE)
      .map((doc) => doc.document_id);
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('docs', ready.join(','));
        return next;
      },
      { replace: true },
    );
  }, [raw, documents.data, setParams]);

  return useMemo(() => {
    const byId = new Map((documents.data ?? []).map((doc) => [doc.document_id, doc]));
    const ids = parseIds(raw);
    const docs = ids.map((id) => byId.get(id)).filter((doc): doc is Document => Boolean(doc));
    const ready = docs.filter((doc) => doc.status === 'ready');
    return {
      ids,
      docs,
      ready,
      byId,
      isLoading: documents.isLoading || (raw === null && !documents.error),
      error: documents.error,
      refetch: documents.refetch,
    };
  }, [documents.data, documents.error, documents.isLoading, documents.refetch, raw]);
}
