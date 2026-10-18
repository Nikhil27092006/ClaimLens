import { describe, expect, it } from 'vitest';
import type { QueryResult } from '@/api/types';
import { citedNumbers, evidenceFor, parseAnswer, shortTitle } from './answer';

describe('parseAnswer', () => {
  it('splits citations and marks highlight phrases once', () => {
    const parts = parseAnswer('Adapters match full fine-tuning [2]. They match again [1].', [
      'match full fine-tuning',
    ]);

    expect(parts).toEqual([
      { kind: 'text', text: 'Adapters ' },
      { kind: 'mark', text: 'match full fine-tuning' },
      { kind: 'text', text: ' ' },
      { kind: 'cite', n: 2 },
      { kind: 'text', text: '. They match again ' },
      { kind: 'cite', n: 1 },
      { kind: 'text', text: '.' },
    ]);
    expect(citedNumbers(parts)).toEqual([2, 1]);
  });
});

describe('evidenceFor', () => {
  it('finds the first evidence for a paper across claims', () => {
    const result: QueryResult = {
      answer: '',
      claims: [
        { claim: 'a', status: 'SUPPORTED', confidence: 0.9, evidence: [] },
        {
          claim: 'b',
          status: 'SUPPORTED',
          confidence: 0.8,
          evidence: [{ chunk_id: 'DOC002_CH042', document_id: 'DOC002', page: 8, quote: 'q' }],
        },
      ],
    };
    expect(evidenceFor(result, 'DOC002')?.page).toBe(8);
    expect(evidenceFor(result, 'DOC003')).toBeUndefined();
  });
});

describe('shortTitle', () => {
  it('keeps short titles and trims long ones at a joining word', () => {
    expect(shortTitle('Low-Rank Adapters at Scale')).toBe('Low-Rank Adapters at Scale');
    expect(shortTitle('Quantized Adapters for Open Models')).toBe('Quantized Adapters');
  });
});
