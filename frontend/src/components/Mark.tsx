import type { ReactNode } from 'react';

/** Highlighter mark: marker background, ink text, 0 3px padding (base style in index.css). */
export function Mark({ children }: { children: ReactNode }) {
  return <mark>{children}</mark>;
}
