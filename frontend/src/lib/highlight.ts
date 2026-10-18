export interface HighlightParts {
  pre: string;
  highlight: string;
  post: string;
}

/**
 * Splits `text` around the first case-insensitive occurrence of `highlight`. Returns null when
 * there is nothing to highlight, so callers can render the plain text instead.
 */
export function splitHighlight(text: string, highlight?: string): HighlightParts | null {
  if (!highlight) return null;
  const index = text.toLowerCase().indexOf(highlight.toLowerCase());
  if (index < 0) return null;
  const end = index + highlight.length;
  return { pre: text.slice(0, index), highlight: text.slice(index, end), post: text.slice(end) };
}
