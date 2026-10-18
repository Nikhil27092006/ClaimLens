import { useId, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export type TextAreaVariant =
  | 'boxed' // bordered field, like TextInput
  | 'claim' // 36px display text on a dashed rule (Check screen claim box)
  | 'bare'; // borderless, inside a bordered composer (Ask follow-up)

export interface TextAreaProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'className'
> {
  label: string;
  /** Keep the label for screen readers only. Labels are visible by default. */
  hideLabel?: boolean;
  hint?: string;
  error?: string;
  variant?: TextAreaVariant;
  className?: string;
}

const VARIANTS: Record<TextAreaVariant, string> = {
  boxed: 'border-1.5 bg-sheet px-3.5 py-3 text-[16px] leading-[1.5]',
  claim:
    // Grows with the claim (field-sizing where supported, else the rows attribute); 28px on phones.
    'resize-none border-b-1.5 border-dashed bg-transparent pb-2 font-display text-[28px] font-bold leading-[1.15] tracking-[-0.6px] [field-sizing:content] md:text-claim',
  bare: 'resize-none bg-transparent px-4 py-3.5 text-[16px]',
};

function borderColor(variant: TextAreaVariant, hasError: boolean): string {
  if (hasError) return 'border-contra';
  return variant === 'claim' ? 'border-rule-dashed' : 'border-ink';
}

export function TextArea({
  label,
  hideLabel = false,
  hint,
  error,
  variant = 'boxed',
  id,
  className,
  ...rest
}: TextAreaProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={fieldId} className={cn('text-[14px] font-semibold', hideLabel && 'sr-only')}>
        {label}
      </label>
      <textarea
        {...rest}
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          'w-full min-w-0 text-ink',
          VARIANTS[variant],
          borderColor(variant, Boolean(error)),
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
