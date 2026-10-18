import { Outlet } from 'react-router-dom';
import { AppHeader } from '@/components/AppHeader';
import { AccountMenu } from '@/features/auth/AccountMenu';
import { NAV_ITEMS } from './nav';

export function AppLayout() {
  return (
    <div className="graph-paper flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only font-mono text-label uppercase no-underline focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-ink focus:px-4 focus:py-3 focus:text-marker"
      >
        Skip to content
      </a>
      <AppHeader items={NAV_ITEMS} account={<AccountMenu />} />
      {/* Pages own their layout: most use PageContainer, Ask is full-bleed. */}
      <main id="main" tabIndex={-1} className="flex flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  );
}
