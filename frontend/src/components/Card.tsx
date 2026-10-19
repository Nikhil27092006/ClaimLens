import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export type CardVariant =
  | 'major' // 1.5px ink: claim box, answer card, tables
  | 'evidence' // 1px ink: evidence cards
  | 'dashed' // 1.5px dashed ink: drop zone, empty states
  | 'partial'; // 1.5px dashed amber, no fill: partial evidence

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

const VARIANTS: Record<CardVariant, string> = {
  major: 'border-1.5 border-ink bg-sheet',
  evidence: 'border border-ink bg-sheet',
  dashed: 'border-1.5 border-dashed border-ink bg-sheet',
  partial: 'border-1.5 border-dashed border-partial-edge bg-transparent',
};

const PADDING: Record<CardPadding, string> = {
  none: '',
  sm: 'px-5 py-[18px]',
  md: 'px-5 py-5 md:px-7 md:py-6',
  lg: 'p-7',
};

export interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: 'div' | 'section' | 'article' | 'aside';
  variant?: CardVariant;
  padding?: CardPadding;
}

/** Square sheet with an ink border. `className` is for layout (flex, gap). */
export function Card({
  as: Tag = 'div',
  variant = 'major',
  padding = 'md',
  className,
  ...rest
}: CardProps) {
  return <Tag {...rest} className={cn(VARIANTS[variant], PADDING[padding], className)} />;
}
