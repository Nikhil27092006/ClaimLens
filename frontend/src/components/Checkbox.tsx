import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'className'
> {
  label: ReactNode;
  /** Keep the label for screen readers only, e.g. "Select <paper title>" in a table row. */
  hideLabel?: boolean;
  /** Bordered toggle style, e.g. Compare's "Highlight differences". */
  boxed?: boolean;
  className?: string;
}

export function Checkbox({
  label,
  hideLabel = false,
  boxed = false,
  className,
  ...rest
}: CheckboxProps) {
  return (
    <label
      className={cn(
        'inline-flex cursor-pointer items-center gap-2.5',
        // Content-box like the artboard's <label>: min-height excludes the border.
        boxed &&
          'box-content min-h-11 border-1.5 border-ink bg-sheet px-3.5 text-[15px] font-semibold',
        className,
      )}
    >
      {/* Keeps the browser's default checkbox margin, as the artboards do. */}
      <input
        {...rest}
        type="checkbox"
        className="m-[3px_3px_3px_4px] h-[18px] w-[18px] cursor-pointer accent-ink"
      />
      <span className={hideLabel ? 'sr-only' : undefined}>{label}</span>
    </label>
  );
}
