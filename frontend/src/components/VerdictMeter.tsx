import { cn } from '@/lib/cn';

interface VerdictMeterProps {
  supports: number;
  partial: number;
  contradicts: number;
  /** md = 44px bar (verdict band), sm = 14px bar (login example card). */
  size?: 'md' | 'sm';
}

function segments(count: number, kind: string): string[] {
  return Array.from({ length: Math.max(0, count) }, (_, i) => `${kind}-${i}`);
}

/** One segment per paper: solid blue, hatched amber, solid orange. Read as a single image. */
export function VerdictMeter({ supports, partial, contradicts, size = 'md' }: VerdictMeterProps) {
  const total = supports + partial + contradicts;
  const label =
    total === 0
      ? 'Evidence balance: no supporting or contradicting papers'
      : `Evidence balance: ${supports} support, ${partial} partial, ${contradicts} contradict`;
  const partialClass =
    size === 'md'
      ? 'hatch-partial border-1.5 border-partial-edge'
      : 'hatch-partial-sm border border-partial-edge';

  return (
    <div
      role="img"
      aria-label={label}
      className={cn('flex', size === 'md' ? 'h-11 gap-1' : 'h-3.5 gap-[3px]')}
    >
      {total === 0 && <div className="flex-1 border-1.5 border-dashed border-rule-dashed" />}
      {segments(supports, 'support').map((key) => (
        <div key={key} className="flex-1 bg-support" />
      ))}
      {segments(partial, 'partial').map((key) => (
        <div key={key} className={cn('flex-1', partialClass)} />
      ))}
      {segments(contradicts, 'contra').map((key) => (
        <div key={key} className="flex-1 bg-contra" />
      ))}
    </div>
  );
}
