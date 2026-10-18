import { splitHighlight } from '@/lib/highlight';
import { cn } from '@/lib/cn';
import { Mark } from './Mark';

type QuoteContent =
  /** Pre-split parts, as in the design fixtures. */
  | { pre?: string; highlight: string; post?: string; text?: never }
  /** Full text; `highlight` is marked where it first occurs (case-insensitive). */
  | { text: string; highlight?: string; pre?: never; post?: never };

export type QuoteProps = QuoteContent & {
  /** md = 17px (evidence cards), lg = 18px (conflict cards). */
  size?: 'md' | 'lg';
  tone?: 'ink' | 'ink-2';
};

/** A verbatim quote from a paper, in Newsreader italic with curly quotes. */
export function Quote(props: QuoteProps) {
  const { size = 'md', tone = 'ink-2' } = props;
  const parts =
    props.text === undefined
      ? { pre: props.pre ?? '', highlight: props.highlight, post: props.post ?? '' }
      : splitHighlight(props.text, props.highlight);

  return (
    <blockquote
      className={cn(
        'font-quote italic leading-[1.5]',
        size === 'md' ? 'text-[17px]' : 'text-[18px]',
        tone === 'ink' ? 'text-ink' : 'text-ink-2',
      )}
    >
      “
      {parts ? (
        <>
          {parts.pre}
          <Mark>{parts.highlight}</Mark>
          {parts.post}
        </>
      ) : (
        props.text
      )}
      ”
    </blockquote>
  );
}
