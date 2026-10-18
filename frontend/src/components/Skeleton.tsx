import type { CSSProperties } from 'react';
import { cn } from '@/lib/cn';

interface SkeletonProps {
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
  /** paper = on light surfaces, ink = on dark panels. */
  tone?: 'paper' | 'ink';
}

/**
 * Square placeholder block with a subtle opacity pulse (no shimmer); the pulse stops under
 * prefers-reduced-motion. Decorative: announce loading separately (e.g. aria-busy + text).
 */
export function Skeleton({ width = '100%', height = 16, tone = 'paper' }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'block motion-safe:animate-pulse',
        tone === 'ink' ? 'bg-rule-on-ink' : 'bg-grid',
      )}
      style={{ width, height }}
    />
  );
}
