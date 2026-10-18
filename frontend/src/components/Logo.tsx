import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';

interface LogoProps {
  to?: string;
  /** Light variant for dark panels (login left side). */
  onInk?: boolean;
}

export function Logo({ to = '/', onInk = false }: LogoProps) {
  return (
    <Link
      to={to}
      // Pinned so the split wordmark is not read as "Claim Lens".
      aria-label="ClaimLens"
      className={cn(
        'flex items-center gap-2.5 font-display text-[22px] font-extrabold tracking-[-0.5px] no-underline',
        onInk ? 'text-on-ink' : 'text-ink',
      )}
    >
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
        <rect
          x="1"
          y="1"
          width="24"
          height="24"
          strokeWidth="1.5"
          className={onInk ? 'stroke-on-ink' : 'stroke-ink'}
        />
        <rect x="5" y="10" width="16" height="6" className="fill-marker" />
        <path d="M5 13h16" strokeWidth="1.5" className="stroke-ink" />
      </svg>
      <span>
        Claim<span className={cn('bg-marker px-[3px]', onInk && 'text-ink')}>Lens</span>
      </span>
    </Link>
  );
}
