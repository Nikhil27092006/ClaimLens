import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Tag = 'div' | 'p' | 'span' | 'h2' | 'h3';
type Tone = 'muted' | 'ink' | 'marker' | 'support' | 'contra' | 'partial';

const TONES: Record<Tone, string> = {
  muted: 'text-muted',
  ink: 'text-ink',
  marker: 'text-marker',
  support: 'text-support',
  contra: 'text-contra',
  partial: 'text-partial',
};

interface SectionLabelProps {
  children: ReactNode;
  as?: Tag;
  id?: string;
  /** Defaults to ink for headings ("Supports · 3") and muted for labels ("Verdict"). */
  tone?: Tone;
  /** sm = 12px (most labels), md = 13px (column and panel headings). */
  size?: 'sm' | 'md';
  /** Semibold; on by default for headings, which the artboards render bold. */
  strong?: boolean;
  /** Leading 12px status square, e.g. the "Supports · 3" column heading. */
  swatch?: 'support' | 'contra';
}

/** Mono uppercase label: "VERDICT", "CLAIMS IN THIS ANSWER", "AGENT TRACE". */
export function SectionLabel({
  children,
  as: Tag = 'div',
  id,
  tone,
  size = 'sm',
  strong,
  swatch,
}: SectionLabelProps) {
  const isHeading = Tag === 'h2' || Tag === 'h3';
  return (
    <Tag
      id={id}
      className={cn(
        'font-mono uppercase tracking-[0.6px]',
        size === 'sm' ? 'text-[12px]' : 'text-[13px]',
        (strong ?? isHeading) ? 'font-semibold' : 'font-normal',
        TONES[tone ?? (isHeading ? 'ink' : 'muted')],
        swatch && 'flex items-center gap-2.5',
      )}
    >
      {swatch && (
        <span
          aria-hidden="true"
          className={cn('h-3 w-3 shrink-0', swatch === 'support' ? 'bg-support' : 'bg-contra')}
        />
      )}
      {children}
    </Tag>
  );
}
