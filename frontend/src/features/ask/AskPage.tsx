import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useId, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import { useStartQuery } from '@/api/hooks';
import { ApiError } from '@/api/client';
import { ButtonLink } from '@/components/Button';
import { DarkPanel } from '@/components/DarkPanel';
import { EmptyState } from '@/components/EmptyState';
import { ErrorBanner } from '@/components/ErrorBanner';
import { ArrowRightIcon } from '@/components/icons';
import { Overlay } from '@/components/Overlay';
import { PageContainer } from '@/components/PageContainer';
import { SectionLabel } from '@/components/SectionLabel';
import { Skeleton } from '@/components/Skeleton';
import { TextArea } from '@/components/TextArea';
import { EvidenceViewer, type PaperMeta } from '@/features/evidence/EvidenceViewer';
import { useEvidenceViewer, type EvidenceTarget } from '@/features/evidence/useEvidenceViewer';
import { useScope } from '@/features/library/useScope';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import { useMediaQuery } from '@/lib/useMediaQuery';
import { AnswerBlock, type AskEntry } from './AnswerBlock';
import { shortTitle } from './answer';

const SUGGESTIONS = [
  'Does 4-bit quantization hurt adapter quality on reasoning tasks?',
  'Which paper used the largest model?',
];

/** Questions asked about one set of papers, kept for the session in the query cache. */
function useAskHistory(scopeKey: string) {
  const queryClient = useQueryClient();
  const key = ['ask-history', scopeKey];
  const { data } = useQuery({
    queryKey: key,
    queryFn: () => [] as AskEntry[],
    initialData: [] as AskEntry[],
    staleTime: Infinity,
    gcTime: Infinity,
  });
  const add = (entry: AskEntry) =>
    queryClient.setQueryData<AskEntry[]>(key, (prev = []) => [...prev, entry]);
  return { entries: data, add };
}

/** /ask?docs=… (artboard "03 · Ask + Evidence viewer"). */
export function AskPage() {
  useDocumentTitle('Ask');
  const scope = useScope();
  const viewer = useEvidenceViewer();
  const narrow = useMediaQuery('(max-width: 1023px)');
  const viewerTitleId = useId();
  const scopeIds = scope.ready.map((doc) => doc.document_id);
  const history = useAskHistory(scopeIds.join(','));
  const start = useStartQuery();
  const [draft, setDraft] = useState('');
  const [busyJob, setBusyJob] = useState<string | null>(null);
  const busy = start.isPending || busyJob !== null;

  const ask = (question: string) => {
    const text = question.trim();
    if (!text || busy || scopeIds.length === 0) return;
    start.mutate(
      { question: text, document_ids: scopeIds },
      {
        onSuccess: ({ job_id }) => {
          history.add({ jobId: job_id, question: text, askedAt: new Date().toISOString() });
          setBusyJob(job_id);
          setDraft('');
        },
      },
    );
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    ask(draft);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      ask(draft);
    }
  };
  const onSettled = useCallback(
    (jobId: string) => setBusyJob((current) => (current === jobId ? null : current)),
    [],
  );
  const openEvidence = (target: EvidenceTarget, trigger: HTMLElement) =>
    viewer.open(target, trigger);

  // Esc closes the inline viewer (the narrow-screen sheet handles Esc itself).
  const { target, close } = viewer;
  useEffect(() => {
    if (!target || narrow) return;
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [target, narrow, close]);

  const papers: Record<string, PaperMeta> = Object.fromEntries(
    scope.docs.map((doc) => [
      doc.document_id,
      { title: doc.title, authors: doc.authors, year: doc.year },
    ]),
  );

  if (scope.isLoading) {
    return (
      <PageContainer>
        <h1 className="sr-only">Ask</h1>
        <div aria-busy="true" className="flex flex-col gap-3">
          <span className="sr-only">Loading papers…</span>
          <Skeleton width="50%" height={28} />
          <Skeleton height={120} />
        </div>
      </PageContainer>
    );
  }

  if (scope.error) {
    return (
      <PageContainer>
        <h1 className="sr-only">Ask</h1>
        <ErrorBanner
          title="Could not load your papers"
          message={scope.error.message}
          onRetry={() => void scope.refetch()}
        />
      </PageContainer>
    );
  }

  if (scope.ready.length === 0) {
    return (
      <PageContainer>
        <h1 className="font-display text-claim font-extrabold md:text-h1">Ask</h1>
        <EmptyState
          title="Choose papers to ask about"
          description="Select ready papers in the Library, then ask a question. Every answer cites the page it came from."
          action={<ButtonLink to="/library">Go to Library</ButtonLink>}
        />
      </PageContainer>
    );
  }

  const viewerPanel = target ? (
    <EvidenceViewer
      target={target}
      meta={papers[target.doc]}
      titleId={viewerTitleId}
      onClose={close}
      onPageChange={viewer.setPage}
    />
  ) : (
    <div className="flex flex-col gap-4">
      <SectionLabel as="h2" id={viewerTitleId} size="md" tone="marker">
        Evidence viewer
      </SectionLabel>
      <p className="max-w-[420px] text-[14px] leading-[1.5] text-muted-on-ink-2">
        Open a citation like <span className="font-mono text-marker">[2 · p.8]</span> to see the
        cited sentence highlighted on its page.
      </p>
    </div>
  );

  const startError = start.error instanceof ApiError ? start.error : undefined;
  const followUp = history.entries.length > 0;

  return (
    <div className="flex flex-1 flex-wrap items-stretch">
      <section
        aria-label="Conversation"
        className="flex min-w-0 flex-[999_1_664px] flex-col gap-6 px-4 py-6 md:p-8"
      >
        <div className="flex flex-wrap items-center gap-2 font-mono text-[12px]">
          <span className="uppercase tracking-[0.6px] text-muted">Scope</span>
          {scope.ready.map((doc, index) => (
            <span key={doc.document_id} title={doc.title} className="bg-ink px-2 py-1 text-sheet">
              [{index + 1}] {shortTitle(doc.title)}
            </span>
          ))}
          <Link
            to={`/library?sel=${scopeIds.join(',')}`}
            className="border border-dashed border-ink px-2 py-1 no-underline"
          >
            + add paper
          </Link>
        </div>

        {!followUp && (
          <div className="flex max-w-[760px] flex-col gap-3">
            <p className="font-mono text-label uppercase text-muted">Ask the selected papers</p>
            <h1 className="font-display text-[26px] font-bold leading-[1.15] tracking-[-0.6px] md:text-[32px]">
              What do you want to know?
            </h1>
            <p className="text-[16px] leading-[1.55] text-ink-2">
              Answers cite the paper and page for every claim. Try:
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => ask(question)}
                  disabled={busy}
                  className="border border-rule-dashed bg-sheet px-3 py-2 text-left text-[15px] hover:border-ink"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {history.entries.map((entry, index) => (
          <AnswerBlock
            key={entry.jobId}
            entry={entry}
            scope={scopeIds}
            first={index === 0}
            onOpen={openEvidence}
            onSettled={onSettled}
            onRetry={ask}
          />
        ))}

        {startError && (
          <div className="max-w-[760px]">
            <ErrorBanner
              title="Could not ask"
              code={startError.code}
              message={startError.message}
            />
          </div>
        )}

        <div className="flex-grow" />
        <form onSubmit={onSubmit} className="flex max-w-[763px] border-1.5 border-ink bg-sheet">
          <TextArea
            label={followUp ? 'Ask a follow-up' : 'Ask a question'}
            hideLabel
            variant="bare"
            rows={2}
            className="flex-1"
            placeholder={
              followUp
                ? 'Ask a follow-up — e.g. “Which paper used the largest model?”'
                : 'Ask a question about these papers'
            }
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={onKeyDown}
          />
          <button
            type="submit"
            aria-label="Send"
            disabled={busy || !draft.trim()}
            className="flex w-16 shrink-0 items-center justify-center border-l-1.5 border-ink bg-marker text-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowRightIcon size={22} />
          </button>
        </form>
      </section>

      {narrow ? (
        target && (
          <Overlay variant="sheet" labelledBy={viewerTitleId} onClose={close}>
            <DarkPanel padding="lg" className="min-h-full">
              {viewerPanel}
            </DarkPanel>
          </Overlay>
        )
      ) : (
        <DarkPanel
          as="aside"
          aria-labelledby={viewerTitleId}
          padding="lg"
          className="flex min-w-0 flex-[1_1_576px] flex-col gap-4"
        >
          {viewerPanel}
        </DarkPanel>
      )}
    </div>
  );
}
