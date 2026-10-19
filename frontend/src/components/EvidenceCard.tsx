import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { Card } from './Card';
import { Quote } from './Quote';

interface EvidenceCardProps {
  /** Paper title. */
  title: string;
  /** Source number shown as [n]. */
  n: number;
  stance: 'supports' | 'contradicts';
  quote: string;
  /** Span of the quote to mark, if known. */
  highlight?: string;
  page: number;
  /** As the paper labels it: "§4.2 Results", "Fig. 2", "Table 3". */
  section?: string;
  /** "Open page →" navigates here, or calls onOpen (e.g. to open the viewer drawer). */
  openTo?: string;
  onOpen?: () => void;
  /** The artboard nests cards under an h2 column heading, hence h3 by default. */
  headingLevel?: 3 | 4;
}

/** One quote with its paper, citation number and page, plus a link to the page. */
export function EvidenceCard({
  title,
  n,
  stance,
  quote,
  highlight,
  page,
  section,
  openTo,
  onOpen,
  headingLevel = 3,
}: EvidenceCardProps) {
  const Heading = headingLevel === 3 ? 'h3' : 'h4';
  const openLabel = `Open page ${page} of ${title}`;
  // Ink like the artboard's global link colour (the footer around it is muted).
  const openClass = 'font-semibold text-ink underline hover:text-support';

  return (
    <Card as="article" variant="evidence" padding="sm" className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <Heading className="text-[15px] font-bold leading-[1.35]">{title}</Heading>
        <span
          className={cn(
            'font-mono text-[12px] font-semibold',
            stance === 'supports' ? 'text-support' : 'text-contra',
          )}
        >
          [{n}]
        </span>
      </div>
      <Quote text={quote} highlight={highlight} />
      <div className="flex flex-wrap justify-between gap-2 border-t border-dashed border-rule-dashed pt-2.5 font-mono text-[12px] text-muted">
        <span>{section ? `p. ${page} · ${section}` : `p. ${page}`}</span>
        {openTo !== undefined ? (
          <Link to={openTo} aria-label={openLabel} className={openClass}>
            Open page →
          </Link>
        ) : (
          onOpen && (
            <button type="button" aria-label={openLabel} onClick={onOpen} className={openClass}>
              Open page →
            </button>
          )
        )}
      </div>
    </Card>
  );
}
