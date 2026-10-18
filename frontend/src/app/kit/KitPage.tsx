import { useId, useState, type ReactNode } from 'react';
import { Button, ButtonLink } from '@/components/Button';
import { Card } from '@/components/Card';
import { Checkbox } from '@/components/Checkbox';
import { CitationChip } from '@/components/CitationChip';
import { DarkPanel } from '@/components/DarkPanel';
import { DocStatus } from '@/components/DocStatus';
import { EmptyState } from '@/components/EmptyState';
import { ErrorBanner } from '@/components/ErrorBanner';
import { EvidenceCard } from '@/components/EvidenceCard';
import { ArrowRightIcon, UploadIcon } from '@/components/icons';
import { Logo } from '@/components/Logo';
import { Mark } from '@/components/Mark';
import { PageContainer } from '@/components/PageContainer';
import { PdfPagePlaceholder } from '@/components/PdfPagePlaceholder';
import { Quote } from '@/components/Quote';
import { SectionLabel } from '@/components/SectionLabel';
import { SegmentedControl } from '@/components/SegmentedControl';
import { Skeleton } from '@/components/Skeleton';
import { StatusTag } from '@/components/StatusTag';
import { TextArea } from '@/components/TextArea';
import { TextInput } from '@/components/TextInput';
import { TraceList } from '@/components/TraceList';
import { VerdictBand } from '@/components/VerdictBand';
import { VerdictMeter } from '@/components/VerdictMeter';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import { KIT_CONTRADICTS, KIT_SUPPORTS, KIT_TRACE } from './fixtures';

function KitSection({ title, children }: { title: string; children: ReactNode }) {
  const id = useId();
  return (
    <section aria-labelledby={id} className="flex flex-col gap-3">
      <SectionLabel as="h2" id={id} size="md" tone="ink">
        {title}
      </SectionLabel>
      {children}
    </section>
  );
}

type Filter = 'all' | 'contradicted' | 'partial';

/** Dev-only component gallery (/_kit). Sample content comes from the design artboards. */
export function KitPage() {
  useDocumentTitle('Component kit');
  const [lastAction, setLastAction] = useState('—');
  const [claim, setClaim] = useState(
    '“LoRA matches full fine-tuning on math and coding benchmarks.”',
  );
  const [highlightDiffs, setHighlightDiffs] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');
  const act = (name: string) => () => setLastAction(name);

  return (
    <PageContainer>
      <div className="flex flex-col gap-1.5">
        <p className="font-mono text-label uppercase text-muted">Dev only · /_kit</p>
        <h1 className="font-display text-claim font-extrabold md:text-h1">Component kit</h1>
      </div>
      <p className="font-mono text-[12px] text-muted" aria-live="polite">
        Last action: {lastAction}
      </p>

      <KitSection title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={act('Re-check claim')}>Re-check claim →</Button>
          <Button variant="secondary" onClick={act('Edit sources')}>
            Edit sources
          </Button>
          <Button variant="primary-sheet" size="lg" onClick={act('Sign in')}>
            Sign in
          </Button>
          <ButtonLink to="/_kit">Ask across 3 papers →</ButtonLink>
          <Button variant="secondary" disabled>
            Compare 3 selected
          </Button>
          <Button loading>Checking…</Button>
        </div>
        <div className="max-w-[420px]">
          <Button variant="marker-cta" fullWidth onClick={act('Demo')}>
            Try the live demo — no account
            <span aria-hidden="true">→</span>
          </Button>
        </div>
        <DarkPanel className="flex flex-wrap gap-1.5">
          <Button variant="ghost-on-ink" onClick={act('Previous page')}>
            ← p.7
          </Button>
          <Button variant="ghost-on-ink" onClick={act('Next page')}>
            p.9 →
          </Button>
        </DarkPanel>
      </KitSection>

      <KitSection title="Inputs">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <TextInput label="Email" type="email" placeholder="you@university.edu" />
            <TextInput
              label="Password"
              type="password"
              labelAction={<a href="#forgot">Forgot?</a>}
            />
            <TextInput
              label="…or fetch by link"
              mono
              placeholder="arXiv URL, DOI or Semantic Scholar link"
              hint="arXiv, DOI and Semantic Scholar links work."
            />
            <TextInput
              label="Max papers"
              defaultValue="12"
              error="Choose between 3 and 10 papers."
            />
          </div>
          <div className="flex flex-col gap-4">
            <TextArea
              label="Claim"
              hideLabel
              variant="claim"
              rows={2}
              value={claim}
              onChange={(event) => setClaim(event.target.value)}
            />
            <TextArea label="Notes" rows={3} placeholder="Anything the agent should know" />
            <form
              className="flex border-1.5 border-ink bg-sheet"
              onSubmit={(event) => {
                event.preventDefault();
                setLastAction('Send follow-up');
              }}
            >
              <TextArea
                label="Ask a follow-up"
                hideLabel
                variant="bare"
                rows={2}
                className="flex-1"
                placeholder="Ask a follow-up — e.g. “Which paper used the largest model?”"
              />
              <button
                type="submit"
                aria-label="Send"
                className="flex w-16 shrink-0 items-center justify-center border-l-1.5 border-ink bg-marker text-ink"
              >
                <ArrowRightIcon size={22} />
              </button>
            </form>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Checkbox
            boxed
            label="Highlight differences"
            checked={highlightDiffs}
            onChange={(event) => setHighlightDiffs(event.target.checked)}
          />
          <Checkbox label="Select Low-Rank Adapters at Scale" hideLabel defaultChecked />
          <Checkbox label="Semantic Scholar" defaultChecked />
          <SegmentedControl
            label="Filter"
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: 'All', count: 3 },
              { value: 'contradicted', label: 'Contradicted', count: 2 },
              { value: 'partial', label: 'Partial', count: 1 },
            ]}
          />
        </div>
      </KitSection>

      <KitSection title="Labels, marks, quotes, citations">
        <Card className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3 font-mono text-label uppercase text-muted">
            <SectionLabel as="span" tone="ink" strong>
              Claim under review
            </SectionLabel>
            <span aria-hidden="true">·</span>
            <span>Check #0042</span>
          </div>
          <div className="flex flex-wrap gap-6">
            <SectionLabel as="h3" size="md" swatch="support">
              Supports · 3
            </SectionLabel>
            <SectionLabel as="h3" size="md" swatch="contra">
              Contradicts · 2
            </SectionLabel>
            <SectionLabel tone="partial" strong>
              Partially supports · 1
            </SectionLabel>
          </div>
          <p className="max-w-[440px] text-[16px] leading-[1.55] text-ink-2">
            The literature splits on <Mark>which benchmarks count</Mark>. Papers that test on
            instruction-following agree; papers that test on code and math generation report a gap.
          </p>
          <Quote
            pre="On instruction-following suites, LoRA "
            highlight="recovers 98–100% of full fine-tuning accuracy"
            post=" across all model sizes tested."
          />
          <Quote
            size="lg"
            tone="ink"
            text="LoRA recovers nearly all of full fine-tuning accuracy across our evaluation suite."
          />
          <p className="text-[17px] leading-[1.65]">
            Mostly no. One paper reports that 4-bit adapters{' '}
            <Mark>match 16-bit full fine-tuning</Mark> across its benchmark suite{' '}
            <CitationChip n={2} page={8} onClick={act('Citation 2')} />. The third does not report
            quantized results, so it neither supports nor contradicts the point{' '}
            <CitationChip n={3} tone="neutral" onClick={act('Citation 3')} />.
          </p>
        </Card>
      </KitSection>

      <KitSection title="Status">
        <Card className="flex flex-col gap-2.5">
          <SectionLabel>Claims in this answer</SectionLabel>
          {(
            [
              ['SUPPORTED', '4-bit adapters match 16-bit fine-tuning', '0.92'],
              ['PARTIALLY_SUPPORTED', 'Holds on instruction-following; math untested', '0.71'],
              ['INSUFFICIENT_EVIDENCE', 'Effect on code generation', '—'],
              ['CONTRADICTED', 'LoRA closes the gap on code', '0.88'],
            ] as const
          ).map(([status, text, confidence]) => (
            <div key={status} className="flex flex-wrap items-center gap-2.5">
              <StatusTag status={status} />
              <span className="text-[15px]">{text}</span>
              <span className="font-mono text-[12px] text-muted">{confidence}</span>
            </div>
          ))}
        </Card>
        <Card className="flex flex-wrap items-start gap-10">
          <DocStatus status="ready" chunks={184} />
          <DocStatus status="processing" progress={62} />
          <DocStatus status="failed" onRetry={act('Retry with OCR')} />
        </Card>
      </KitSection>

      <KitSection title="Cards and panels">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>major · 1.5px ink</Card>
          <Card variant="evidence" padding="sm">
            evidence · 1px ink
          </Card>
          <Card variant="dashed">dashed · drop zone</Card>
          <Card variant="partial" padding="sm">
            partial · dashed amber
          </Card>
          <DarkPanel>
            <SectionLabel as="h3" size="md" tone="marker">
              Dark panel
            </SectionLabel>
          </DarkPanel>
          <DarkPanel grid padding="lg" className="flex items-center">
            <Logo onInk />
          </DarkPanel>
        </div>
      </KitSection>

      <KitSection title="Verdict">
        <VerdictBand
          verdict="Contested."
          summary="The literature splits on which benchmarks count. Papers that test on instruction-following agree; papers that test on code and math generation report a gap."
          highlight="which benchmarks count"
          supports={3}
          partial={1}
          contradicts={2}
        />
        <VerdictBand verdict="" summary="" supports={0} partial={0} contradicts={0} loading />
        <div className="grid max-w-[520px] gap-3">
          <VerdictMeter supports={3} partial={1} contradicts={2} size="sm" />
          <VerdictMeter supports={0} partial={0} contradicts={0} size="sm" />
        </div>
      </KitSection>

      <KitSection title="Evidence and agent trace">
        <div className="flex flex-wrap items-start gap-6">
          <div className="grid min-w-0 flex-[999_1_640px] grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
            <div className="flex flex-col gap-3">
              <SectionLabel as="h3" size="md" swatch="support">
                Supports · {KIT_SUPPORTS.length}
              </SectionLabel>
              {KIT_SUPPORTS.map((e) => (
                <EvidenceCard
                  key={e.n}
                  {...e}
                  stance="supports"
                  headingLevel={4}
                  onOpen={act(`Open [${e.n}]`)}
                />
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <SectionLabel as="h3" size="md" swatch="contra">
                Contradicts · {KIT_CONTRADICTS.length}
              </SectionLabel>
              {KIT_CONTRADICTS.map((e) => (
                <EvidenceCard
                  key={e.n}
                  {...e}
                  stance="contradicts"
                  headingLevel={4}
                  onOpen={act(`Open [${e.n}]`)}
                />
              ))}
              <Card as="article" variant="partial" padding="sm" className="flex flex-col gap-2.5">
                <SectionLabel tone="partial" strong>
                  Partially supports · 1
                </SectionLabel>
                <h4 className="text-[15px] font-bold">Rank Matters More Than You Think</h4>
                <p className="text-[14px] leading-[1.5] text-ink-2">
                  Matches full fine-tuning on code only at rank 256 and above; the claim omits this
                  condition.
                </p>
                <p className="font-mono text-[12px] text-muted">p. 11 · §5.1 Ablations · [6]</p>
              </Card>
            </div>
          </div>
          <DarkPanel
            as="aside"
            aria-label="Agent trace"
            className="flex min-w-0 flex-[1_1_344px] flex-col gap-4"
          >
            <SectionLabel as="h3" size="md" tone="marker">
              Agent trace
            </SectionLabel>
            <p className="text-[14px] leading-[1.5] text-muted-on-ink-2">
              Every step the agent took, in order. Each quote was checked against its page before it
              was shown.
            </p>
            <TraceList steps={KIT_TRACE} />
            <p className="border border-marker p-3 font-mono text-[12px] leading-[1.5] text-marker">
              31 / 31 quotes verified on page.
              <br />0 citations dropped.
            </p>
          </DarkPanel>
        </div>
      </KitSection>

      <KitSection title="PDF page placeholder">
        <DarkPanel padding="lg" className="max-w-[560px]">
          <PdfPagePlaceholder
            page={8}
            runningHead="4 RESULTS"
            highlight="Across all eight benchmarks in Table 3, our 4-bit adapters match 16-bit full fine-tuning to within run-to-run variance."
            figureLabel="Table 3"
          />
        </DarkPanel>
      </KitSection>

      <KitSection title="Loading, empty, error">
        <Card className="flex flex-col gap-3">
          <Skeleton width="40%" height={24} />
          <Skeleton />
          <Skeleton width="85%" />
        </Card>
        <EmptyState
          icon={<UploadIcon />}
          title="No papers yet"
          description="Upload 2–5 PDFs to ask, compare or find conflicts."
          action={<ButtonLink to="/library">Go to Library</ButtonLink>}
        />
        <ErrorBanner
          code="UPSTREAM_ERROR"
          message="Semantic Scholar did not respond. The steps completed so far are kept."
          onRetry={act('Retry check')}
        />
      </KitSection>
    </PageContainer>
  );
}
