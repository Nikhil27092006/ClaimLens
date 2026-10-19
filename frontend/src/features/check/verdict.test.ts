import { describe, expect, it } from 'vitest';
import type { Evidence } from '@/api/types';
import { verdictCounts, verdictLabel } from './verdict';

const ev = (document_id: string): Evidence => ({
  chunk_id: `${document_id}_CH1`,
  document_id,
  page: 1,
  quote: 'q',
});

describe('verdictLabel', () => {
  it.each([
    [[ev('A')], [], 'Supported.'],
    [[], [ev('B')], 'Refuted.'],
    [[ev('A')], [ev('B')], 'Contested.'],
    [[], [], 'Not enough evidence.'],
  ])('maps supports/contradicts to the verdict', (supports, contradicts, label) => {
    expect(verdictLabel({ supports, contradicts })).toBe(label);
  });
});

describe('verdictCounts', () => {
  it('counts papers, not quotes', () => {
    expect(
      verdictCounts({ supports: [ev('A'), ev('A'), ev('B')], partial: [], contradicts: [ev('C')] }),
    ).toEqual({ supports: 2, partial: 0, contradicts: 1 });
  });
});
