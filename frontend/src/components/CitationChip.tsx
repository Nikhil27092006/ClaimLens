import type { MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';

interface CitationChipProps {
  /** Source number, as in [2]. */
  n: number;
  page?: number;
  /** support = blue on tint (evidence found); neutral = grey (cited, no verdict). */
  tone?: 'support' | 'neutral';
  /** Navigate to the evidence (e.g. a viewer URL); otherwise renders a button. */
  to?: string;
  /** Receives the click event so callers can return focus to the chip later. */
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}

/** Inline citation: [2 · p.8]. Opens the evidence for that source and page. */
export function CitationChip({ n, page, tone = 'support', to, onClick }: CitationChipProps) {
  const text = page === undefined ? `[${n}]` : `[${n} · p.${page}]`;
  const label = page === undefined ? `Source ${n}` : `Source ${n}, page ${page}`;
  const className = cn(
    'px-[5px] py-px align-baseline font-mono text-[13px] font-semibold leading-[normal] no-underline',
    tone === 'support'
      ? 'bg-support-tint text-support hover:text-support'
      : 'bg-chip-neutral text-muted hover:text-muted',
  );

  if (to !== undefined) {
    return (
      <Link to={to} aria-label={label} className={className}>
        {text}
      </Link>
    );
  }
  return (
    <button type="button" aria-label={label} onClick={onClick} className={className}>
      {text}
    </button>
  );
}
