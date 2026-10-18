import { useId } from 'react';
import type { ApiError } from '@/api/client';
import type { JobStatus } from '@/api/sse';
import type { CheckResult, JobStep } from '@/api/types';
import { DarkPanel } from '@/components/DarkPanel';
import { SectionLabel } from '@/components/SectionLabel';
import { TraceList } from '@/components/TraceList';

interface TraceRailProps {
  steps: JobStep[];
  status: JobStatus;
  result?: CheckResult;
  error?: ApiError;
}

/** The dark Agent trace rail: steps stream in (announced politely), then the verified count. */
export function TraceRail({ steps, status, result, error }: TraceRailProps) {
  const headingId = useId();
  const dropped = result ? result.total_quotes - result.verified_quotes : 0;

  return (
    <DarkPanel
      as="aside"
      aria-labelledby={headingId}
      className="flex min-w-0 flex-[1_1_344px] flex-col gap-4"
    >
      <SectionLabel as="h2" id={headingId} size="md" tone="marker">
        Agent trace
      </SectionLabel>
      <p className="text-[14px] leading-[1.5] text-muted-on-ink-2">
        Every step the agent took, in order. Each quote was checked against its page before it was
        shown.
      </p>
      <TraceList steps={steps} live />

      {status === 'running' && (
        <p className="flex items-center gap-2 border-t border-rule-on-ink pt-2.5 font-mono text-[12px] text-muted-on-ink">
          <span aria-hidden="true" className="h-2 w-2 bg-marker motion-safe:animate-pulse" />
          Working…
        </p>
      )}
      {status === 'error' && (
        <p className="flex items-start gap-2 border-t border-rule-on-ink pt-2.5 text-[14px] leading-[1.4]">
          <span aria-hidden="true" className="mt-1.5 h-2 w-2 shrink-0 bg-contra" />
          Stopped: {error?.message ?? 'the check failed.'}
        </p>
      )}
      {result && (
        <p className="border border-marker p-3 font-mono text-[12px] leading-[1.5] text-marker">
          {result.verified_quotes} / {result.total_quotes} quotes verified on page.
          <br />
          {dropped} citation{dropped === 1 ? '' : 's'} dropped.
        </p>
      )}
    </DarkPanel>
  );
}
