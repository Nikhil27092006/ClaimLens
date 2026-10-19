import { cn } from '@/lib/cn';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface SegmentedControlProps<T extends string> {
  /** Accessible name of the group, e.g. "Filter". */
  label: string;
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** A row of toggle buttons with aria-pressed (Conflicts filter: "All · 3"). */
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div role="group" aria-label={label} className="inline-flex border-1.5 border-ink">
      {options.map((option, index) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'min-h-11 px-3.5 font-mono text-[12px]',
              index > 0 && 'border-l-1.5 border-ink',
              active ? 'bg-ink text-marker' : 'bg-sheet text-ink hover:bg-sheet-2',
            )}
          >
            {option.count === undefined ? option.label : `${option.label} · ${option.count}`}
          </button>
        );
      })}
    </div>
  );
}
