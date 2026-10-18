import type { Document } from '@/api/types';
import { Checkbox } from '@/components/Checkbox';
import { DocStatus } from '@/components/DocStatus';
import { CloseIcon } from '@/components/icons';
import { formatRelative } from '@/lib/relativeTime';
import { paperMeta, sourceLabel } from './format';

interface PapersTableProps {
  documents: Document[];
  selected: ReadonlySet<string>;
  onToggle: (id: string, checked: boolean) => void;
  onRetry: (id: string) => void;
  onDelete: (doc: Document, trigger: HTMLElement) => void;
}

const TH = 'px-2 py-3 font-bold';
const TD = 'px-2 py-4 align-middle';

/** The papers table (artboard "02 · Library"); scrolls sideways inside its box on phones. */
export function PapersTable({
  documents,
  selected,
  onToggle,
  onRetry,
  onDelete,
}: PapersTableProps) {
  const now = Date.now();
  return (
    <section
      aria-label="Papers"
      className="relative overflow-x-auto border-1.5 border-ink bg-sheet"
    >
      <table className="w-full min-w-[860px] border-collapse text-[15px]">
        <thead>
          <tr className="bg-ink text-left font-mono text-[12px] uppercase tracking-[0.6px] text-on-ink">
            <th scope="col" className="w-5 px-5 py-3">
              <span className="sr-only">Select</span>
            </th>
            <th scope="col" className={TH}>
              Paper
            </th>
            <th scope="col" className={TH}>
              Source
            </th>
            <th scope="col" className={TH}>
              Pages
            </th>
            <th scope="col" className={TH}>
              Status
            </th>
            <th scope="col" className="py-3 pl-2 pr-5 font-bold">
              Added
            </th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr key={doc.document_id} className="border-t border-rule">
              <td className="px-5 py-4 align-middle">
                <Checkbox
                  hideLabel
                  label={`Select ${doc.title}`}
                  checked={selected.has(doc.document_id)}
                  disabled={doc.status !== 'ready'}
                  onChange={(event) => onToggle(doc.document_id, event.target.checked)}
                />
              </td>
              <td className={TD}>
                <div className="font-bold">{doc.title}</div>
                <div className="mt-0.5 font-mono text-[12px] text-muted">{paperMeta(doc)}</div>
              </td>
              <td className={`${TD} font-mono text-[12px]`}>{sourceLabel(doc)}</td>
              <td className={`${TD} font-mono text-[13px]`}>{doc.pages} pp</td>
              <td className={TD}>
                <DocStatus
                  status={doc.status}
                  chunks={doc.chunks}
                  progress={doc.progress}
                  onRetry={() => onRetry(doc.document_id)}
                />
              </td>
              <td className="py-4 pl-2 pr-5 align-middle text-[14px] text-muted">
                <div className="flex items-center justify-between gap-3">
                  <span>{formatRelative(doc.uploaded_at, now)}</span>
                  <button
                    type="button"
                    aria-label={`Delete ${doc.title}`}
                    onClick={(event) => onDelete(doc, event.currentTarget)}
                    className="flex h-7 w-7 shrink-0 items-center justify-center border border-transparent text-muted hover:border-ink hover:text-ink"
                  >
                    <CloseIcon size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
