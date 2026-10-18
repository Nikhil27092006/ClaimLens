import { useId } from 'react';
import type { CheckResult, Evidence } from '@/api/types';
import { Card } from '@/components/Card';
import { EvidenceCard } from '@/components/EvidenceCard';
import { SectionLabel } from '@/components/SectionLabel';
import { Skeleton } from '@/components/Skeleton';

export type OpenEvidence = (evidence: Evidence, n: number) => void;

interface EvidenceColumnsProps {
  result: CheckResult;
  onOpen: OpenEvidence;
}

const COLUMNS =
  'grid min-w-0 flex-[999_1_640px] grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6';
const where = (e: Evidence, n?: number) =>
  [`p. ${e.page}`, e.section, n ? `[${n}]` : undefined].filter(Boolean).join(' · ');
const openClass = 'font-semibold text-ink underline hover:text-support';

/** Supports / Contradicts columns, the partial card and the collapsed "not enough" list. */
export function EvidenceColumns({ result, onOpen }: EvidenceColumnsProps) {
  const supId = useId();
  const conId = useId();
  // [n] is the paper's position in the result, as the agent trace and verdict count them.
  const papers = new Map(
    result.papers.map((p, i) => [p.document_id, { n: i + 1, title: p.title }]),
  );
  const paper = (e: Evidence) => papers.get(e.document_id) ?? { n: 0, title: e.document_id };

  const card = (e: Evidence, stance: 'supports' | 'contradicts') => {
    const { n, title } = paper(e);
    return (
      <EvidenceCard
        key={e.chunk_id}
        title={title}
        n={n}
        stance={stance}
        quote={e.quote}
        highlight={e.highlight}
        page={e.page}
        section={e.section}
        onOpen={() => onOpen(e, n)}
      />
    );
  };

  return (
    <div className={COLUMNS}>
      <section aria-labelledby={supId} className="flex flex-col gap-3">
        <SectionLabel as="h2" id={supId} size="md" swatch="support">
          Supports · {result.supports.length}
        </SectionLabel>
        {result.supports.map((e) => card(e, 'supports'))}
        {result.supports.length === 0 && (
          <p className="font-mono text-[12px] text-muted">No paper supports the claim.</p>
        )}
      </section>

      <section aria-labelledby={conId} className="flex flex-col gap-3">
        <SectionLabel as="h2" id={conId} size="md" swatch="contra">
          Contradicts · {result.contradicts.length}
        </SectionLabel>
        {result.contradicts.map((e) => card(e, 'contradicts'))}
        {result.contradicts.length === 0 && (
          <p className="font-mono text-[12px] text-muted">No paper contradicts the claim.</p>
        )}

        {result.partial.length > 0 && (
          <Card as="article" variant="partial" padding="sm" className="flex flex-col gap-2.5">
            <SectionLabel tone="partial" strong>
              Partially supports · {result.partial.length}
            </SectionLabel>
            {result.partial.map((e) => {
              const { n, title } = paper(e);
              return (
                <div key={e.chunk_id} className="flex flex-col gap-2.5">
                  <h3 className="text-[15px] font-bold">{title}</h3>
                  <p className="text-[14px] leading-[1.5] text-ink-2">{e.note ?? `“${e.quote}”`}</p>
                  <div className="flex flex-wrap justify-between gap-2 font-mono text-[12px] text-muted">
                    <span>{where(e, n)}</span>
                    <button
                      type="button"
                      aria-label={`Open page ${e.page} of ${title}`}
                      className={openClass}
                      onClick={() => onOpen(e, n)}
                    >
                      Open page →
                    </button>
                  </div>
                </div>
              );
            })}
          </Card>
        )}

        {result.insufficient.length > 0 && (
          <details className="border-1.5 border-dashed border-insufficient px-5 py-4">
            <summary className="cursor-pointer font-mono text-label font-semibold uppercase text-muted">
              Not enough evidence · {result.insufficient.length}
            </summary>
            <ul className="mt-3 flex flex-col gap-3">
              {result.insufficient.map((e) => {
                const { n, title } = paper(e);
                return (
                  <li key={e.chunk_id} className="flex flex-col gap-1.5">
                    <span className="text-[14px] font-bold">{title}</span>
                    <span className="font-quote text-[15px] italic text-ink-2">“{e.quote}”</span>
                    <span className="flex flex-wrap justify-between gap-2 font-mono text-[12px] text-muted">
                      <span>{where(e, n)}</span>
                      <button
                        type="button"
                        aria-label={`Open page ${e.page} of ${title}`}
                        className={openClass}
                        onClick={() => onOpen(e, n)}
                      >
                        Open page →
                      </button>
                    </span>
                  </li>
                );
              })}
            </ul>
          </details>
        )}
      </section>
    </div>
  );
}

/** Placeholder columns while the check runs. */
export function EvidenceColumnsSkeleton() {
  return (
    <div className={COLUMNS} aria-hidden="true">
      {[0, 1].map((column) => (
        <div key={column} className="flex flex-col gap-3">
          <Skeleton width={140} height={17} />
          {[0, 1].map((card) => (
            <Card key={card} variant="evidence" padding="sm" className="flex flex-col gap-3">
              <Skeleton width="70%" height={20} />
              <Skeleton height={16} />
              <Skeleton width="85%" height={16} />
              <Skeleton width="40%" height={14} />
            </Card>
          ))}
        </div>
      ))}
    </div>
  );
}
