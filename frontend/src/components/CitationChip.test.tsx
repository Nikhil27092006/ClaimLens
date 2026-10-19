import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithRouter } from '@/test/render';
import { CitationChip } from './CitationChip';

describe('CitationChip', () => {
  it('renders [n · p.X] as a button with a spoken label', async () => {
    const onClick = vi.fn();
    render(<CitationChip n={2} page={8} onClick={onClick} />);

    const chip = screen.getByRole('button', { name: 'Source 2, page 8' });
    expect(chip).toHaveTextContent('[2 · p.8]');
    expect(chip).toHaveClass('bg-support-tint', 'text-support');
    await userEvent.click(chip);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('renders a neutral chip without a page', () => {
    render(<CitationChip n={3} tone="neutral" />);

    const chip = screen.getByRole('button', { name: 'Source 3' });
    expect(chip).toHaveTextContent('[3]');
    expect(chip).toHaveClass('bg-chip-neutral', 'text-muted');
  });

  it('renders a link when given a destination', () => {
    renderWithRouter(<CitationChip n={1} page={7} to="/ask?doc=DOC001&page=7" />);

    expect(screen.getByRole('link', { name: 'Source 1, page 7' })).toHaveAttribute(
      'href',
      '/ask?doc=DOC001&page=7',
    );
  });
});
