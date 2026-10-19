import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DocStatus } from './DocStatus';

describe('DocStatus', () => {
  it('shows ready with the chunk count', () => {
    render(<DocStatus status="ready" chunks={184} />);
    expect(screen.getByText('Ready · 184 chunks')).toBeInTheDocument();
  });

  it('shows indexing progress as a progressbar, clamped to 0–100', () => {
    const { rerender } = render(<DocStatus status="processing" progress={62} />);

    expect(screen.getByText(/Indexing · 62%/)).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Indexing progress' })).toHaveAttribute(
      'aria-valuenow',
      '62',
    );

    rerender(<DocStatus status="processing" progress={140} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });

  it('offers a retry when failed', async () => {
    const onRetry = vi.fn();
    render(<DocStatus status="failed" onRetry={onRetry} />);

    expect(screen.getByText(/Failed/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'retry with OCR' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
