import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { Logo } from './Logo';

export interface NavItem {
  /** Two-digit mono prefix, e.g. "01". Decorative; hidden from screen readers. */
  index: string;
  label: string;
  to: string;
  /** Match the path exactly (needed for "/"). */
  end?: boolean;
}

interface AppHeaderProps {
  items: readonly NavItem[];
  modelLabel?: string;
  accountInitials?: string;
  /** Replaces the plain account button, e.g. with the session menu. */
  account?: ReactNode;
}

export function AppHeader({
  items,
  modelLabel = 'Nemotron 3 · Token Factory',
  accountInitials = 'AC',
  account,
}: AppHeaderProps) {
  return (
    <header className="flex flex-wrap items-center gap-x-8 gap-y-3 border-b-1.5 border-ink bg-sheet px-4 py-3.5 md:px-8">
      <Logo />

      {/* Below md the nav drops to its own full-width row under the logo and account button. */}
      <nav aria-label="Main" className="order-last w-full md:order-none md:w-auto">
        <ul className="flex flex-wrap gap-1 font-mono text-label uppercase">
          {items.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'block px-3 py-2 no-underline',
                    isActive ? 'bg-ink text-marker hover:text-marker' : 'text-ink',
                  )
                }
              >
                <span aria-hidden="true">{item.index} </span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div aria-hidden="true" className="flex-grow" />

      <p className="hidden items-center gap-2 font-mono text-[12px] text-muted md:flex">
        <span aria-hidden="true" className="h-2 w-2 bg-support" />
        <span className="sr-only">Model: </span>
        {modelLabel}
      </p>

      {account ?? (
        <button
          type="button"
          aria-label="Account"
          className="h-9 w-9 border-1.5 border-ink bg-sheet font-mono text-[12px] font-semibold text-ink"
        >
          {accountInitials}
        </button>
      )}
    </header>
  );
}
