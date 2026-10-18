import type { DocStatus as DocStatusValue } from '@/api/types';

interface DocStatusProps {
  status: DocStatusValue;
  chunks?: number;
  /** Indexing progress, 0–100. */
  progress?: number;
  onRetry?: () => void;
}

/** Library status cell: "Ready · 184 chunks", "Indexing · 62%" with a bar, or "Failed · retry". */
export function DocStatus({ status, chunks, progress = 0, onRetry }: DocStatusProps) {
  if (status === 'processing') {
    const percent = Math.round(Math.min(100, Math.max(0, progress)));
    return (
      <span className="flex w-[170px] flex-col gap-1.5 font-mono text-[12px]">
        Indexing · {percent}%
        <span
          role="progressbar"
          aria-label="Indexing progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          className="block h-1.5 bg-grid"
        >
          <span className="block h-1.5 bg-ink" style={{ width: `${percent}%` }} />
        </span>
      </span>
    );
  }

  if (status === 'failed') {
    return (
      <span className="inline-flex items-center gap-2 font-mono text-[12px] text-contra">
        <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 bg-contra" />
        Failed
        {onRetry && (
          <>
            {' · '}
            <button type="button" onClick={onRetry} className="text-contra underline">
              retry with OCR
            </button>
          </>
        )}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 font-mono text-[12px]">
      <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 bg-support" />
      {chunks === undefined ? 'Ready' : `Ready · ${chunks} chunks`}
    </span>
  );
}
