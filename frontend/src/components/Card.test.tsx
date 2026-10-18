import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Card } from './Card';
import { DarkPanel } from './DarkPanel';

describe('Card', () => {
  it('renders the chosen element, variant and padding', () => {
    render(
      <Card as="article" variant="evidence" padding="sm" aria-label="Evidence">
        Quote
      </Card>,
    );

    const card = screen.getByRole('article', { name: 'Evidence' });
    expect(card).toHaveClass('border', 'border-ink', 'bg-sheet', 'px-5');
  });

  it('defaults to a major sheet card', () => {
    render(<Card>Claim box</Card>);
    expect(screen.getByText('Claim box')).toHaveClass('border-1.5', 'border-ink', 'bg-sheet');
  });

  it('has dashed and partial variants', () => {
    render(
      <>
        <Card variant="dashed">Drop zone</Card>
        <Card variant="partial">Partial</Card>
      </>,
    );

    expect(screen.getByText('Drop zone')).toHaveClass('border-dashed', 'border-ink');
    expect(screen.getByText('Partial')).toHaveClass('border-dashed', 'border-partial-edge');
  });
});

describe('DarkPanel', () => {
  it('renders an ink panel, plain by default', () => {
    render(
      <DarkPanel as="aside" aria-label="Agent trace">
        Steps
      </DarkPanel>,
    );

    const panel = screen.getByRole('complementary', { name: 'Agent trace' });
    expect(panel).toHaveClass('bg-ink', 'text-on-ink', 'p-[22px]');
  });

  it('can draw the dark grid', () => {
    render(
      <DarkPanel grid padding="lg">
        Login panel
      </DarkPanel>,
    );
    expect(screen.getByText('Login panel')).toHaveClass('graph-paper-ink', 'p-7');
  });
});
