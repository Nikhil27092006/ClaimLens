import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { cn } from '@/lib/cn';

export type ButtonVariant =
  | 'primary' // ink, marker text: "Re-check claim →", "Ask across 3 papers →"
  | 'primary-sheet' // ink, sheet text: "Sign in", "Fetch"
  | 'secondary' // outlined: "Edit sources", "Export CSV"
  | 'marker-cta' // marker with hard shadow: "Try the live demo — no account"
  | 'ghost-on-ink'; // on dark panels: "← p.7"

/** sm 36px, md 44px, field 46px (matches inputs), lg 48px, xl 56px. */
export type ButtonSize = 'sm' | 'md' | 'field' | 'lg' | 'xl';

interface ButtonStyleProps {
  variant?: ButtonVariant;
  /** Defaults per variant: ghost-on-ink → sm (36px), marker-cta → xl (56px), others → md (44px). */
  size?: ButtonSize;
  fullWidth?: boolean;
}

// Values from the artboards. Each variant owns its border width, padding and weight. Links styled
// as buttons pin their hover colour so the global `a:hover` blue does not apply.
const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'justify-center border-1.5 border-ink bg-ink px-5 font-semibold text-marker hover:text-marker',
  'primary-sheet':
    'justify-center border-1.5 border-ink bg-ink px-4 font-semibold text-sheet hover:text-sheet',
  secondary:
    'justify-center border-1.5 border-ink bg-transparent px-[18px] font-semibold text-ink hover:bg-sheet hover:text-ink',
  'marker-cta':
    'justify-between border-1.5 border-ink bg-marker px-5 font-bold text-ink shadow-hard hover:text-ink focus-visible:shadow-[0_0_0_2px_var(--ink),4px_4px_0_var(--ink)]',
  'ghost-on-ink':
    'justify-center border border-muted bg-transparent px-3 font-mono text-on-ink hover:border-on-ink hover:text-on-ink',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'min-h-9 text-[13px]',
  md: 'min-h-11 text-[15px]',
  field: 'min-h-[46px] text-[15px]',
  lg: 'min-h-12 text-[16px]',
  xl: 'min-h-14 text-[16px]',
};

const DEFAULT_SIZE: Record<ButtonVariant, ButtonSize> = {
  primary: 'md',
  'primary-sheet': 'md',
  secondary: 'md',
  'marker-cta': 'xl',
  'ghost-on-ink': 'sm',
};

/**
 * Shared by Button and ButtonLink. `className` is for layout only (margins, alignment).
 *
 * `contentBox` mirrors the artboards, where links styled as buttons (and the demo CTA) are
 * <a> elements: their min-height excludes the border, so they stand 3px taller than <button>s.
 */
export function buttonClasses(
  { variant = 'primary', size, fullWidth = false }: ButtonStyleProps,
  className?: string,
  contentBox = variant === 'marker-cta',
): string {
  return cn(
    // A content-box element cannot use w-full (padding would overflow); a block flex fills instead.
    fullWidth && contentBox ? 'flex' : 'inline-flex',
    'items-center gap-2 whitespace-nowrap no-underline',
    'disabled:cursor-not-allowed disabled:opacity-40 aria-busy:cursor-wait',
    contentBox && 'box-content',
    VARIANTS[variant],
    SIZES[size ?? DEFAULT_SIZE[variant]],
    fullWidth && !contentBox && 'w-full',
    className,
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonStyleProps {
  /** Keeps focus on the button (aria-disabled, not disabled) and ignores clicks. */
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant,
    size,
    fullWidth,
    loading = false,
    className,
    type = 'button',
    onClick,
    children,
    ...rest
  },
  ref,
) {
  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      className={buttonClasses({ variant, size, fullWidth }, className)}
      aria-busy={loading || undefined}
      aria-disabled={loading || rest['aria-disabled']}
      onClick={loading ? (event) => event.preventDefault() : onClick}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="h-2 w-2 shrink-0 bg-current motion-safe:animate-pulse"
        />
      )}
      {children}
    </button>
  );
});

export interface ButtonLinkProps extends LinkProps, ButtonStyleProps {}

/** A router link that looks like a button, e.g. "Ask across 3 papers →". */
export function ButtonLink({ variant, size, fullWidth, className, ...rest }: ButtonLinkProps) {
  return (
    <Link {...rest} className={buttonClasses({ variant, size, fullWidth }, className, true)} />
  );
}
