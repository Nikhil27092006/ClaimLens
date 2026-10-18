import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: ReactNode;
  /** Shown in a 52px marker square, e.g. <UploadIcon />. */
  icon?: ReactNode;
  /** A button or link, e.g. "Go to Library". */
  action?: ReactNode;
  headingLevel?: 2 | 3;
}

/** Dashed-zone empty state (Library drop zone styling), no illustration. */
export function EmptyState({
  title,
  description,
  icon,
  action,
  headingLevel = 2,
}: EmptyStateProps) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <div className="flex flex-wrap items-center gap-[18px] border-1.5 border-dashed border-ink bg-sheet p-7">
      {icon && (
        <div
          aria-hidden="true"
          className="flex h-[52px] w-[52px] shrink-0 items-center justify-center border-1.5 border-ink bg-marker text-ink"
        >
          {icon}
        </div>
      )}
      <div className="flex min-w-0 flex-[1_1_240px] flex-col gap-1">
        <Heading className="text-[17px] font-bold">{title}</Heading>
        {description && <p className="text-[14px] text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
