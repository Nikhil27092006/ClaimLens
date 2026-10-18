import { describe, expect, it } from 'vitest';
import { findQuote, renderTextItem } from './textMatch';

// Text items as pdf.js returns them for page 8 of the sample DOC002.pdf.
const ITEMS = [
  '4 RESULTS',
  ' ',
  '8',
  'holds the data and the evaluation harness constant. Across all eight benchmarks in Table 3,',
  'our 4-bit adapters match 16-bit full fine-tuning to within run-to-run variance. The',
  'comparison holds the data and the evaluation harness constant.',
];

const QUOTE =
  'Across all eight benchmarks in Table 3, our 4-bit adapters match 16-bit full fine-tuning to within run-to-run variance.';

describe('findQuote', () => {
  it('finds a quote that spans two text items', () => {
    const match = findQuote(ITEMS, QUOTE);

    expect(match.kind).toBe('exact');
    expect(match.ranges).toHaveLength(2);
    const [first, second] = match.ranges;
    expect(ITEMS[3]?.slice(first?.start, first?.end)).toBe(
      'Across all eight benchmarks in Table 3',
    );
    expect(ITEMS[4]?.slice(second?.start, second?.end)).toBe(
      'our 4-bit adapters match 16-bit full fine-tuning to within run-to-run variance',
    );
  });

  it('ignores line-end hyphenation, case and quote styles', () => {
    const match = findQuote(
      ['the adapter closes the remain-', 'ing gap on commonsense'],
      '“The adapter CLOSES the remaining gap”',
    );
    expect(match.kind).toBe('exact');
  });

  it('falls back to the best approximate window', () => {
    const match = findQuote(
      ITEMS,
      'Across all eight benchmarks, our 4-bit adapters equal 16-bit full fine-tuning.',
    );

    expect(match.kind).toBe('approximate');
    expect(match.ranges.map((r) => r.item)).toEqual([3, 4]);
  });

  it('reports no match when the quote is not on the page', () => {
    expect(findQuote(ITEMS, 'Below rank 64, code accuracy drops sharply.')).toEqual({
      kind: 'none',
      ranges: [],
    });
    expect(findQuote(ITEMS, undefined).kind).toBe('none');
  });
});

describe('renderTextItem', () => {
  it('wraps the matched span in a mark and escapes HTML', () => {
    expect(renderTextItem('a <b> c', { item: 0, start: 2, end: 5 })).toBe(
      'a <mark class="pdf-hit">&lt;b&gt;</mark> c',
    );
    expect(renderTextItem('x & y', undefined)).toBe('x &amp; y');
  });
});
