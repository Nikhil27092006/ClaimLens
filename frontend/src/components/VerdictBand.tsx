import { splitHighlight } from '@/lib/highlight';
import { cn } from '@/lib/cn';
import { Mark } from './Mark';
import { SectionLabel } from './SectionLabel';
import { Skeleton } from './Skeleton';
import { VerdictMeter } from './VerdictMeter';

interface VerdictBandProps {
  /** Computed label, e.g. "Contested." (see the build prompt §4). */
  verdict: string;
  summary: string;
  /** Key phrase in the summary to mark, if the backend sends one. */
  highlight?: string;
  supports: number;
  partial: number;
  contradicts: number;
  /** Show skeletons while the check is still running. */
  loading?: boolean;
}

const COUNTS = [
  { key: 'supports', label: 'papers support', className: 'text-support' },
  { key: 'partial', label: 'partially supports', className: 'text-partial' },
  { key: 'contradicts', label: 'papers contradict', className: 'text-contra' },
] as const;

// The two halves share one ink divider whether they sit side by side or stacked: each half draws
// a left and top border, and the wrapper's negative margin hides the ones on the outer edge.
// Flex bases are the artboard's content-box 380px / 520px plus padding and border.
const HALF = 'flex min-w-0 flex-col border-l-1.5 border-t-1.5 border-ink p-5 md:p-7';

export function VerdictBand({
  verdict,
  summary,
  highlight,
  loading = false,
  ...counts
}: VerdictBandProps) {
  const parts = splitHighlight(summary, highlight);

  return (
    <section
      aria-label="Verdict"
      aria-busy={loading || undefined}
      className="overflow-hidden border-1.5 border-ink bg-sheet"
    >
      <div className="-ml-[1.5px] -mt-[1.5px] flex flex-wrap">
        <div className={cn(HALF, 'flex-[1_1_437.5px] gap-2.5')}>
          <SectionLabel>Verdict</SectionLabel>
          {loading ? (
            <>
              <span className="sr-only">Checking the evidence…</span>
              <Skeleton width="60%" height={61} />
              <Skeleton width="90%" height={16} />
              <Skeleton width="70%" height={16} />
            </>
          ) : (
            <>
              {/* 64px "Contested." is ~480px wide, so phones get the 36px claim size. */}
              <p className="font-display text-claim font-extrabold md:text-verdict">{verdict}</p>
              <p className="max-w-[440px] text-[16px] leading-[1.55] text-ink-2">
                {parts ? (
                  <>
                    {parts.pre}
                    <Mark>{parts.highlight}</Mark>
                    {parts.post}
                  </>
                ) : (
                  summary
                )}
              </p>
            </>
          )}
        </div>

        <div className={cn(HALF, 'flex-[2_1_577.5px] justify-center gap-[18px]')}>
          <div className="flex justify-between font-mono text-label font-semibold uppercase">
            <span className="text-support">
              <span aria-hidden="true">← </span>Supports
            </span>
            <span className="text-contra">
              Contradicts<span aria-hidden="true"> →</span>
            </span>
          </div>
          {loading ? <Skeleton height={44} /> : <VerdictMeter {...counts} />}
          <dl className="grid grid-cols-3 gap-4">
            {COUNTS.map(({ key, label, className }) => (
              <div key={key} className="flex flex-col-reverse">
                <dt className="text-[14px] text-muted">{label}</dt>
                <dd className={cn('font-display text-[32px] font-bold', className)}>
                  {loading ? '–' : counts[key]}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
