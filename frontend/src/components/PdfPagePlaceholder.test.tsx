import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PdfPagePlaceholder } from './PdfPagePlaceholder';

describe('PdfPagePlaceholder', () => {
  it('renders a page figure with the cited sentence highlighted', () => {
    render(
      <PdfPagePlaceholder
        page={8}
        runningHead="4 RESULTS"
        highlight="Our 4-bit adapters match 16-bit full fine-tuning."
        figureLabel="Table 3"
      />,
    );

    const page = screen.getByRole('figure', { name: 'Page 8' });
    expect(page).toHaveClass('shadow-page');
    expect(screen.getByText('Our 4-bit adapters match 16-bit full fine-tuning.')).toHaveClass(
      'bg-marker',
      'outline-ink',
    );
    expect(screen.getByText('Table 3')).toBeInTheDocument();
  });

  it('omits the highlight and figure when not given', () => {
    const { container } = render(<PdfPagePlaceholder page={1} />);
    expect(container.querySelector('p')).toBeNull();
    expect(screen.queryByText('Table 3')).not.toBeInTheDocument();
  });
});
