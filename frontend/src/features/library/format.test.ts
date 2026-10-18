import { describe, expect, it } from 'vitest';
import { formatRelative } from '@/lib/relativeTime';
import { checkFiles, paperMeta, parseIds, sourceLabel } from './format';

const pdf = (name: string, size = 1000) =>
  new File([new Uint8Array(size)], name, { type: 'application/pdf' });

describe('checkFiles', () => {
  it('accepts PDFs and rejects other types and oversize files', () => {
    const big = pdf('huge.pdf');
    Object.defineProperty(big, 'size', { value: 26 * 1024 * 1024 });
    const { accepted, errors } = checkFiles([
      pdf('a.pdf'),
      new File(['x'], 'notes.txt', { type: 'text/plain' }),
      big,
    ]);
    expect(accepted.map((f) => f.name)).toEqual(['a.pdf']);
    expect(errors).toEqual(['notes.txt is not a PDF.', 'huge.pdf is over 25 MB.']);
  });

  it('rejects more than five files at once', () => {
    const files = Array.from({ length: 6 }, (_, i) => pdf(`p${i}.pdf`));
    const { accepted, errors } = checkFiles(files);
    expect(accepted).toEqual([]);
    expect(errors).toEqual(['Upload up to 5 PDFs at a time (you chose 6).']);
  });
});

describe('library formatting', () => {
  it('labels sources as the Library shows them', () => {
    expect(sourceLabel({ source: 'upload' })).toBe('Upload');
    expect(sourceLabel({ source: 'search', url: 'https://arxiv.org/abs/1' })).toBe('arXiv');
    expect(sourceLabel({ source: 'search', url: 'https://www.semanticscholar.org/p' })).toBe(
      'Semantic Scholar',
    );
    expect(sourceLabel({ source: 'link', url: 'https://example.org/x.pdf' })).toBe('Link');
  });

  it('shows authors and year, else the file name', () => {
    expect(paperMeta({ authors: 'Rao, Lindqvist et al.', year: 2025, filename: 'x.pdf' })).toBe(
      'Rao, Lindqvist et al. · 2025',
    );
    expect(paperMeta({ filename: 'x.pdf' })).toBe('x.pdf');
  });

  it('parses id lists from the URL', () => {
    expect(parseIds('DOC001, DOC002,,')).toEqual(['DOC001', 'DOC002']);
    expect(parseIds(null)).toEqual([]);
  });

  it('formats relative times', () => {
    const now = Date.parse('2026-10-18T12:00:00Z');
    expect(formatRelative('2026-10-18T11:59:30Z', now)).toBe('just now');
    expect(formatRelative('2026-10-18T11:48:00Z', now)).toBe('12 min ago');
    expect(formatRelative('2026-10-18T09:00:00Z', now)).toBe('3 h ago');
    expect(formatRelative('2026-10-16T12:00:00Z', now)).toBe('2 days ago');
  });
});
