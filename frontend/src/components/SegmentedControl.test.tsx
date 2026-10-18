import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SegmentedControl } from './SegmentedControl';

const OPTIONS = [
  { value: 'all', label: 'All', count: 3 },
  { value: 'contradicted', label: 'Contradicted', count: 2 },
  { value: 'partial', label: 'Partial' },
] as const;

describe('SegmentedControl', () => {
  it('renders a labelled group of toggle buttons with counts', () => {
    render(<SegmentedControl label="Filter" options={OPTIONS} value="all" onChange={vi.fn()} />);

    expect(screen.getByRole('group', { name: 'Filter' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'All · 3' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Contradicted · 2' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(screen.getByRole('button', { name: 'Partial' })).toBeInTheDocument();
  });

  it('reports the chosen value', async () => {
    const onChange = vi.fn();
    render(<SegmentedControl label="Filter" options={OPTIONS} value="all" onChange={onChange} />);

    await userEvent.click(screen.getByRole('button', { name: 'Contradicted · 2' }));
    expect(onChange).toHaveBeenCalledWith('contradicted');
  });
});
