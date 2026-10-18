import { useEffect } from 'react';

/** Sets the tab title to "<title> · ClaimLens" so each route is announced distinctly. */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = `${title} · ClaimLens`;
  }, [title]);
}
