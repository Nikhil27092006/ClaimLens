import type { Evidence, QueryResult } from '@/api/types';

export type AnswerPart =
  { kind: 'text'; text: string } | { kind: 'mark'; text: string } | { kind: 'cite'; n: number };

/**
 * Splits an answer into text, highlighted phrases and [n] citations. Each highlight phrase is
 * marked once, at its first occurrence (case-insensitive).
 */
export function parseAnswer(answer: string, highlights: readonly string[] = []): AnswerPart[] {
  const parts: AnswerPart[] = [];
  const pending = highlights.filter(Boolean);

  for (const token of answer.split(/(\[\d+\])/)) {
    const cite = /^\[(\d+)\]$/.exec(token);
    if (cite) {
      parts.push({ kind: 'cite', n: Number(cite[1]) });
      continue;
    }
    let rest = token;
    while (rest) {
      let best: { index: number; phrase: string } | null = null;
      for (const phrase of pending) {
        const index = rest.toLowerCase().indexOf(phrase.toLowerCase());
        if (index >= 0 && (!best || index < best.index)) best = { index, phrase };
      }
      if (!best) {
        parts.push({ kind: 'text', text: rest });
        break;
      }
      if (best.index > 0) parts.push({ kind: 'text', text: rest.slice(0, best.index) });
      parts.push({ kind: 'mark', text: rest.slice(best.index, best.index + best.phrase.length) });
      pending.splice(pending.indexOf(best.phrase), 1);
      rest = rest.slice(best.index + best.phrase.length);
    }
  }
  return parts;
}

/** Distinct cited paper numbers, in order of first citation. */
export function citedNumbers(parts: AnswerPart[]): number[] {
  return [...new Set(parts.flatMap((part) => (part.kind === 'cite' ? [part.n] : [])))];
}

/** The first evidence in the answer's claims that comes from `documentId`. */
export function evidenceFor(
  result: QueryResult,
  documentId: string | undefined,
): Evidence | undefined {
  if (!documentId) return undefined;
  for (const claim of result.claims) {
    const found = claim.evidence.find((e) => e.document_id === documentId);
    if (found) return found;
  }
  return undefined;
}

/** Shortens long titles for scope chips: "Quantized Adapters for Open Models" → "Quantized Adapters". */
export function shortTitle(title: string): string {
  if (title.length <= 28) return title;
  const cut = title.split(/\s(?:for|of|in|on|with|and)\s/i)[0];
  return cut && cut.length >= 8 ? cut : `${title.slice(0, 26)}…`;
}
