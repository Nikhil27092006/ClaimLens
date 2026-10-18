import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EmptyState } from './EmptyState';
import { UploadIcon } from './icons';

describe('EmptyState', () => {
  it('renders a heading, description, decorative icon and action', () => {
    const { container } = render(
      <EmptyState
        icon={<UploadIcon />}
        title="No papers yet"
        description="Upload 2–5 PDFs to ask, compare or find conflicts."
        action={<button type="button">Upload PDFs</button>}
      />,
    );

    expect(screen.getByRole('heading', { level: 2, name: 'No papers yet' })).toBeInTheDocument();
    expect(screen.getByText(/Upload 2–5 PDFs/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Upload PDFs' })).toBeInTheDocument();
    expect(container.firstElementChild).toHaveClass('border-dashed');
    expect(container.querySelector('svg')?.closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it('supports a lower heading level', () => {
    render(<EmptyState title="Select 2 papers" headingLevel={3} />);
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
  });
});
