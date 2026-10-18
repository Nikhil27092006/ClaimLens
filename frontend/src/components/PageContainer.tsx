import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * The centred page column used by Check, Library, Compare and Conflicts: 1320px of content with
 * 32px padding and 24px gaps (28px on Conflicts). Ask is full-bleed and does not use it.
 */
export function PageContainer({
  children,
  gap = 'default',
}: {
  children: ReactNode;
  gap?: 'default' | 'loose';
}) {
  return (
    <div
      className={cn(
        'mx-auto flex w-full max-w-layout flex-col px-4 py-6 md:p-8',
        gap === 'loose' ? 'gap-7' : 'gap-6',
      )}
    >
      {children}
    </div>
  );
}
