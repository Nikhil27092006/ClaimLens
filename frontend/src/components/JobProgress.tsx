import type { JobStep } from '@/api/types';
import { Card } from './Card';
import { SectionLabel } from './SectionLabel';
import { Skeleton } from './Skeleton';

interface JobProgressProps {
  /** e.g. "Comparing 3 papers…" */
  label: string;
  steps: JobStep[];
}

/** A running job: its streamed steps (announced politely) above placeholder lines. */
export function JobProgress({ label, steps }: JobProgressProps) {
  return (
    <Card aria-busy="true" className="flex flex-col gap-4">
      <SectionLabel>{label}</SectionLabel>
      <ol aria-live="polite" className="flex flex-col gap-1.5 font-mono text-[12px] text-muted">
        {steps.map((step, index) => (
          <li key={`${index}-${step.message}`} className="flex items-center gap-2">
            <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 bg-ink" />
            {step.message}
            {step.via && <span className="text-insufficient">· {step.via}</span>}
          </li>
        ))}
        <li className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 shrink-0 bg-marker motion-safe:animate-pulse"
          />
          Working…
        </li>
      </ol>
      <div aria-hidden="true" className="flex flex-col gap-2.5">
        <Skeleton height={40} />
        <Skeleton height={40} />
        <Skeleton width="80%" height={40} />
      </div>
    </Card>
  );
}
