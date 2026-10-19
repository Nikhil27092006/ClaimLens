import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label: string;
  /** Keep the label for screen readers only. Labels are visible by default. */
  hideLabel?: boolean;
  /** Shown at the right of the label row, e.g. a "Forgot?" link. */
  labelAction?: ReactNode;
  hint?: string;
  error?: string;
  /** Mono field for URLs and IDs ("arXiv URL, DOI or Semantic Scholar link"). */
  mono?: boolean;
  className?: string;
}

export function TextInput({
  label,
  hideLabel = false,
  labelAction,
  hint,
  error,
  mono = false,
  id,
  className,
  ...rest
}: TextInputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className={cn('flex items-baseline justify-between gap-3', hideLabel && 'sr-only')}>
        <label htmlFor={inputId} className="text-[14px] font-semibold">
          {label}
        </label>
        {labelAction && <span className="text-[14px]">{labelAction}</span>}
      </div>
      <input
        {...rest}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          // Content-box like the artboard's inputs: min-height excludes the border.
          'box-content min-w-0 border-1.5 bg-sheet text-ink',
          mono ? 'min-h-11 px-3 font-mono text-[13px]' : 'min-h-[46px] px-3.5 text-[16px]',
          error ? 'border-contra' : 'border-ink',
        )}
      />
      {hint && (
        <p id={hintId} className="text-[14px] text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="font-mono text-[12px] text-contra">
          {error}
        </p>
      )}
    </div>
  );
}
