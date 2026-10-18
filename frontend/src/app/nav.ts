import type { NavItem } from '@/components/AppHeader';
import { env } from '@/lib/env';

const ALL_ITEMS: readonly NavItem[] = [
  { index: '01', label: 'Check', to: '/', end: true },
  { index: '02', label: 'Library', to: '/library' },
  { index: '03', label: 'Ask', to: '/ask' },
  { index: '04', label: 'Compare', to: '/compare' },
  { index: '05', label: 'Conflicts', to: '/conflicts' },
];

/** Check is hidden when VITE_ENABLE_CLAIM_MODE=false. */
export const NAV_ITEMS: readonly NavItem[] = env.enableClaimMode
  ? ALL_ITEMS
  : ALL_ITEMS.filter((item) => item.to !== '/');
