import { describe, expect, it } from 'vitest';
import type { CompareRow } from '@/api/types';
import { cellWhere, rowDiffers, toCsv } from './compareTable';

const row = (attribute: string, a: string, b: string): CompareRow => ({
  attribute,
  values: {
    A: { value: a, chunk_id: 'A1', page: 3, section: '§2' },
    B: { value: b, chunk_id: 'B1', page: 6 },
  },
});

describe('rowDiffers', () => {
  it('ignores case and spacing', () => {
    expect(rowDiffers(row('Metric', 'Accuracy', ' accuracy '), ['A', 'B'])).toBe(false);
    expect(rowDiffers(row('Base model', '7B and 13B', '7B to 65B'), ['A', 'B'])).toBe(true);
  });

  it('treats a missing value as a difference', () => {
    expect(rowDiffers(row('Metric', 'Accuracy', 'Accuracy'), ['A', 'B', 'C'])).toBe(true);
  });
});

describe('cellWhere', () => {
  it('joins page and section', () => {
    expect(cellWhere({ value: 'x', chunk_id: 'c', page: 3, section: '§2' })).toBe('p.3 · §2');
    expect(cellWhere({ value: 'x', chunk_id: 'c', page: 6 })).toBe('p.6');
  });
});

describe('toCsv', () => {
  it('writes a header of paper titles and escapes fields', () => {
    const csv = toCsv(
      [row('Method', 'LoRA, rank 16', 'Say "hi"')],
      [
        { document_id: 'A', title: 'Paper A' },
        { document_id: 'B', title: 'Paper B' },
      ],
    );
    expect(csv).toBe(
      'Attribute,Paper A,Paper B\nMethod,"LoRA, rank 16 (p.3 · §2)","Say ""hi"" (p.6)"',
    );
  });
});
