import type { Document } from '@/api/types';

/** Where a paper came from, as the Library's Source column shows it. */
export function sourceLabel(doc: Pick<Document, 'source' | 'url'>): string {
  if (doc.source === 'upload') return 'Upload';
  const url = doc.url?.toLowerCase() ?? '';
  if (url.includes('arxiv')) return 'arXiv';
  if (url.includes('semanticscholar')) return 'Semantic Scholar';
  if (url.includes('doi.org') || /^10\.\d{4,}\//.test(url)) return 'DOI';
  return doc.source === 'link' ? 'Link' : 'Search';
}

/** "Rao, Lindqvist et al. · 2025", falling back to the file name. */
export function paperMeta(doc: Pick<Document, 'authors' | 'year' | 'filename'>): string {
  const parts = [doc.authors, doc.year].filter(Boolean);
  return parts.length > 0 ? parts.join(' · ') : doc.filename;
}

/** Parses a comma-separated id list from the URL (?docs=, ?sel=). */
export function parseIds(value: string | null): string[] {
  return (value ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
}

export const MAX_FILES = 5;
export const MAX_FILE_BYTES = 25 * 1024 * 1024;

export interface FileCheck {
  accepted: File[];
  errors: string[];
}

const isPdf = (file: File) => file.type === 'application/pdf' || /\.pdf$/i.test(file.name);

/** Client-side checks before upload: PDFs only, at most 5 files, at most 25 MB each. */
export function checkFiles(files: File[]): FileCheck {
  const errors: string[] = [];
  const accepted: File[] = [];
  for (const file of files) {
    if (!isPdf(file)) errors.push(`${file.name} is not a PDF.`);
    else if (file.size > MAX_FILE_BYTES) errors.push(`${file.name} is over 25 MB.`);
    else accepted.push(file);
  }
  if (accepted.length > MAX_FILES) {
    return {
      accepted: [],
      errors: [
        ...errors,
        `Upload up to ${MAX_FILES} PDFs at a time (you chose ${accepted.length}).`,
      ],
    };
  }
  return { accepted, errors };
}
