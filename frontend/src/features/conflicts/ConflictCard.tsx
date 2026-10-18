import { useId, type MouseEvent } from 'react';
import type { Contradiction, ContradictionSide } from '@/api/types';
import { Quote } from '@/components/Quote';
import { StatusTag } from '@/components/StatusTag';
import { cn } from '@/lib/cn';

export type OpenSide = (side: ContradictionSide, trigger: HTMLElement) => void;

interface ConflictCardProps {
  conflict: Contradiction;
  titles: Map<string, string>;
  onOpen: OpenSide;
}

function Side({
  letter,
  side,
  title,
  onOpen,
}: {
  letter: 'A' | 'B';
  side: ContradictionSide;
  title: string;
  onOpen: OpenSide;
}) {
  return (
    <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-2.5 p-5">
      <button
        type="button"
        onClick={(event: MouseEvent<HTMLButtonElement>) => onOpen(side, event.currentTarget)}
        className={cn(
          'self-start text-left font-mono text-[12px] font-semibold hover:underline',
          letter === 'A' ? 'text-support' : 'text-contra',
        )}
      >
        {letter} · {title} · p.{side.page}
        <span className="sr-only">, open the page</span>
      </button>
      <Quote size="lg" tone="ink" text={side.text} />
    </div>
  );
}

/** One disagreement: topic and status, quote A ≠ quote B, and why (artboard "05 · Contradictions"). */
export function ConflictCard({ conflict, titles, onOpen }: ConflictCardProps) {
  const headingId = useId();
  const title = (side: ContradictionSide) =>
    side.title ?? titles.get(side.document_id) ?? side.document_id;

  return (
    <article aria-labelledby={headingId} className="flex flex-col border-1.5 border-ink bg-sheet">
      <div className="flex flex-wrap items-center gap-3 border-b-1.5 border-ink px-5 py-3.5">
        <span className="font-mono text-[12px] text-muted">{conflict.id}</span>
        <h2 id={headingId} className="min-w-0 flex-[1_1_300px] text-[18px] font-bold">
          {conflict.topic}
        </h2>
        <StatusTag status={conflict.status} />
      </div>

      <div className="flex flex-wrap items-stretch">
        <Side letter="A" side={conflict.claim_a} title={title(conflict.claim_a)} onOpen={onOpen} />
        <div
          aria-hidden="true"
          className="flex flex-[1_1_100%] items-center justify-center bg-ink py-1 font-display text-[34px] font-extrabold text-marker md:flex-[0_0_64px] md:py-0"
        >
          ≠
        </div>
        <Side letter="B" side={conflict.claim_b} title={title(conflict.claim_b)} onOpen={onOpen} />
      </div>

      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-3 border-t border-dashed border-rule-dashed bg-sheet-2 px-5 py-3.5">
        <span className="font-mono text-label font-semibold uppercase">Why</span>
        <span className="min-w-0 flex-[1_1_400px] text-[15px] leading-[1.5]">
          {conflict.explanation}
        </span>
        {conflict.factors && conflict.factors.length > 0 && (
          <ul aria-label="Factors" className="flex flex-wrap gap-1.5 font-mono text-[11px]">
            {conflict.factors.map((factor, index) => (
              <li
                key={factor}
                className={
                  index === 0
                    ? 'bg-marker px-1.5 py-0.5'
                    : 'border border-rule-dashed px-1.5 py-0.5'
                }
              >
                {factor}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
