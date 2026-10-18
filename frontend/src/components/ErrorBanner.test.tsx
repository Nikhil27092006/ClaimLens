import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ErrorBanner } from './ErrorBanner';

describe('ErrorBanner', () => {
  it('announces the error with its code and offers a retry', async () => {
    const onRetry = vi.fn();
    render(
      <ErrorBanner
        code="UPSTREAM_ERROR"
        message="Semantic Scholar did not respond."
        onRetry={onRetry}
      />,
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Something went wrong · UPSTREAM_ERROR');
    expect(alert).toHaveTextContent('Semantic Scholar did not respond.');
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('has no retry button without a handler', () => {
    render(<ErrorBanner title="Upload failed" message="File too large." />);
    expect(screen.getByRole('alert')).toHaveTextContent('Upload failed');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
