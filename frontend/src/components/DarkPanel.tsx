import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface DarkPanelProps extends HTMLAttributes<HTMLElement> {
  as?: 'div' | 'section' | 'aside';
  /**
   * Draw the dark graph-paper grid. The artboards use it only on the login panel; the agent
   * trace and evidence viewer are plain ink.
   */
  grid?: boolean;
  /** md = 22px (agent trace), lg = 28px (evidence viewer). */
  padding?: 'md' | 'lg';
}

/** Ink panel with light text. `className` is for layout (flex, gap). */
export function DarkPanel({
  as: Tag = 'div',
  grid = false,
  padding = 'md',
  className,
  ...rest
}: DarkPanelProps) {
  return (
    <Tag
      {...rest}
      className={cn(
        grid ? 'graph-paper-ink' : 'bg-ink',
        'text-on-ink',
        padding === 'md' ? 'p-[22px]' : 'p-7',
        className,
      )}
    />
  );
}
