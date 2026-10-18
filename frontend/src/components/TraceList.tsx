import type { JobStep } from '@/api/types';

/** Seconds since the job started → "03.1s". */
export function formatElapsed(seconds: number): string {
  return `${seconds.toFixed(1).padStart(4, '0')}s`;
}

interface TraceListProps {
  steps: readonly Pick<JobStep, 'message' | 'via' | 't'>[];
  /** Announce new steps politely as they stream in. */
  live?: boolean;
}

/** The agent trace: one row per step with elapsed time, what happened and how (mono). */
export function TraceList({ steps, live = false }: TraceListProps) {
  return (
    <ol aria-live={live ? 'polite' : undefined} className="flex flex-col">
      {steps.map((step, index) => (
        <li
          key={`${index}-${step.message}`}
          className="grid grid-cols-[56px_minmax(0,1fr)] gap-3 border-t border-rule-on-ink py-2.5"
        >
          <span className="font-mono text-[12px] text-muted-on-ink">
            {step.t === undefined ? '' : formatElapsed(step.t)}
          </span>
          <span className="flex flex-col gap-0.5">
            <span className="text-[14px] leading-[1.4]">{step.message}</span>
            {step.via && (
              <span className="font-mono text-[11px] text-muted-on-ink">{step.via}</span>
            )}
          </span>
        </li>
      ))}
    </ol>
  );
}
