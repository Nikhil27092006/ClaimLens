import type { CheckResult, Evidence } from '@/api/types';

/** The verdict word, computed from the evidence (build prompt §4). */
export function verdictLabel(result: Pick<CheckResult, 'supports' | 'contradicts'>): string {
  const supports = result.supports.length > 0;
  const contradicts = result.contradicts.length > 0;
  if (supports && contradicts) return 'Contested.';
  if (supports) return 'Supported.';
  if (contradicts) return 'Refuted.';
  return 'Not enough evidence.';
}

const papersIn = (evidence: Evidence[]) => new Set(evidence.map((e) => e.document_id)).size;

/** Paper counts behind the verdict meter: one segment per paper. */
export function verdictCounts(result: Pick<CheckResult, 'supports' | 'partial' | 'contradicts'>) {
  return {
    supports: papersIn(result.supports),
    partial: papersIn(result.partial),
    contradicts: papersIn(result.contradicts),
  };
}
