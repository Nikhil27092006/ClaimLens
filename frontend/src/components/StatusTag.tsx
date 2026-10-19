import type { ClaimStatus } from '@/api/types';
import { cn } from '@/lib/cn';

// Status is never colour alone: solid fill vs. solid outline vs. dashed outline, plus the word.
const TAGS: Record<ClaimStatus, { label: string; className: string }> = {
  SUPPORTED: { label: 'Supported', className: 'bg-support text-on-status' },
  CONTRADICTED: { label: 'Contradicted', className: 'bg-contra text-on-status' },
  PARTIALLY_SUPPORTED: { label: 'Partial', className: 'border-1.5 border-partial text-partial' },
  INSUFFICIENT_EVIDENCE: {
    label: 'Insufficient',
    className: 'border-1.5 border-dashed border-insufficient text-muted',
  },
};

export function StatusTag({ status }: { status: ClaimStatus }) {
  const tag = TAGS[status];
  return (
    <span
      className={cn(
        'inline-block px-2 py-[3px] font-mono text-[11px] font-semibold uppercase tracking-[0.6px]',
        tag.className,
      )}
    >
      {tag.label}
    </span>
  );
}
