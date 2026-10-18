import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TraceList, formatElapsed } from './TraceList';

describe('formatElapsed', () => {
  it('formats seconds as two-digit mono time', () => {
    expect(formatElapsed(0)).toBe('00.0s');
    expect(formatElapsed(3.14)).toBe('03.1s');
    expect(formatElapsed(21)).toBe('21.0s');
    expect(formatElapsed(125.25)).toBe('125.3s');
  });
});

describe('TraceList', () => {
  it('renders an ordered list of timestamped steps', () => {
    render(
      <TraceList
        steps={[
          { t: 0, message: 'Rewrote the claim into 4 search queries', via: 'nemotron-3-nano' },
          { t: 3.1, message: 'Searched the web — 6 sources' },
        ]}
      />,
    );

    const items = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('00.0s');
    expect(items[0]).toHaveTextContent('nemotron-3-nano');
    expect(items[1]).toHaveTextContent('03.1sSearched the web — 6 sources');
    expect(screen.getByRole('list')).not.toHaveAttribute('aria-live');
  });

  it('can announce new steps politely', () => {
    render(<TraceList steps={[]} live />);
    expect(screen.getByRole('list')).toHaveAttribute('aria-live', 'polite');
  });
});
