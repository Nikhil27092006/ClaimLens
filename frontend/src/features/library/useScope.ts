import { useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDocuments } from '@/api/hooks';
import type { Document } from '@/api/types';
import { parseIds } from './format';

/** At most this many papers go into Ask, Compare or Conflicts when none are chosen. */
const DEFAULT_SCOPE = 10;

/** Only include real indexed papers (DOC- prefix), never mock stubs. */
const isRealPaper = (doc: Document) => doc.document_id.startsWith('DOC-');

/**
 * The papers Ask, Compare and Conflicts work on, driven by ?docs=DOC-xxx,DOC-yyy.
 *
 * - On first load, seeds ?docs= with all currently-ready real papers.
 * - Whenever a new real paper finishes indexing (status flips to "ready"),
 *   it is automatically added to the scope so Ask/Compare/Conflicts pick it up.
 */
export function useScope() {
  const documents = useDocuments();
  const [params, setParams] = useSearchParams();
  const raw = params.get('docs');
  // Track which papers we've already seen as ready so we only add new ones
  const seenReady = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!documents.data) return;

    const realReady = documents.data
      .filter((doc) => doc.status === 'ready' && isRealPaper(doc))
      .map((doc) => doc.document_id);

    if (realReady.length === 0) return;

    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        const current = parseIds(prev.get('docs'));
        const currentSet = new Set(current);

        // Add any newly-ready real papers that aren't in scope yet
        const toAdd = realReady.filter((id) => !currentSet.has(id) && !seenReady.current.has(id));

        if (toAdd.length === 0 && current.length > 0) return prev; // nothing changed

        // Merge existing scope + new papers, capped at DEFAULT_SCOPE
        const merged = [...current.filter((id) => realReady.includes(id)), ...toAdd]
          .slice(0, DEFAULT_SCOPE);

        // Seed with all ready papers when scope is empty
        const final = merged.length > 0 ? merged : realReady.slice(0, DEFAULT_SCOPE);

        // Mark all as seen so we don't re-add on next render
        final.forEach((id) => seenReady.current.add(id));

        next.set('docs', final.join(','));
        return next;
      },
      { replace: true },
    );
  }, [documents.data, setParams]);

  return useMemo(() => {
    const byId = new Map((documents.data ?? []).map((doc) => [doc.document_id, doc]));
    const ids = parseIds(raw);
    const docs = ids.map((id) => byId.get(id)).filter((doc): doc is Document => Boolean(doc));
    const ready = docs.filter((doc) => doc.status === 'ready' && isRealPaper(doc));
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
