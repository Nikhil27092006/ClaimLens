import type { CompareCell, CompareRow, Document } from '@/api/types';

const normalize = (value: string) => value.toLowerCase().replace(/\s+/g, ' ').trim();

/** A row differs when its papers do not all report the same (normalised) value. */
export function rowDiffers(row: CompareRow, documentIds: string[]): boolean {
  const values = documentIds.map((id) => normalize(row.values[id]?.value ?? ''));
  return new Set(values).size > 1;
}

/** "p.3 · §2" for a cell's page link. */
export function cellWhere(cell: CompareCell): string {
  return [cell.page ? `p.${cell.page}` : undefined, cell.section].filter(Boolean).join(' · ');
}

function csvField(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/** The table as CSV: one row per attribute, one column per paper ("value (p.3 · §2)"). */
export function toCsv(
  rows: CompareRow[],
  documents: Pick<Document, 'document_id' | 'title'>[],
): string {
  const header = ['Attribute', ...documents.map((doc) => doc.title)];
  const body = rows.map((row) => [
    row.attribute,
    ...documents.map((doc) => {
      const cell = row.values[doc.document_id];
      if (!cell) return '';
      const where = cellWhere(cell);
      return where ? `${cell.value} (${where})` : cell.value;
    }),
  ]);
  return [header, ...body].map((line) => line.map(csvField).join(',')).join('\n');
}

/** Saves text as a file in the browser. */
export function downloadText(filename: string, text: string, type = 'text/csv;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
