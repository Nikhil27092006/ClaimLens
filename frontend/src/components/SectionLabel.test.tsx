import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SectionLabel } from './SectionLabel';

describe('SectionLabel', () => {
  it('renders a mono uppercase label', () => {
    render(<SectionLabel>Verdict</SectionLabel>);

    expect(screen.getByText('Verdict')).toHaveClass('font-mono', 'uppercase', 'text-muted');
  });

  it('renders headings semibold with an optional swatch', () => {
    render(
      <SectionLabel as="h2" size="md" swatch="support">
        Supports · 3
      </SectionLabel>,
    );

    const heading = screen.getByRole('heading', { level: 2, name: 'Supports · 3' });
    expect(heading).toHaveClass('font-semibold', 'text-[13px]');
    expect(heading.querySelector('[aria-hidden="true"]')).toHaveClass('bg-support');
  });
});
