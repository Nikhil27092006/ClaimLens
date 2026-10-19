import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { VerdictBand } from './VerdictBand';

const SUMMARY =
  'The literature splits on which benchmarks count. Papers that test on instruction-following agree.';

describe('VerdictBand', () => {
  it('shows the verdict, marked summary, meter and counts', () => {
    render(
      <VerdictBand
        verdict="Contested."
        summary={SUMMARY}
        highlight="which benchmarks count"
        supports={3}
        partial={1}
        contradicts={2}
      />,
    );

    const band = screen.getByRole('region', { name: 'Verdict' });
    expect(band).not.toHaveAttribute('aria-busy');
    expect(screen.getByText('Contested.')).toHaveClass('md:text-verdict');
    expect(screen.getByText('which benchmarks count').tagName).toBe('MARK');
    expect(screen.getByRole('img', { name: /3 support, 1 partial, 2 contradict/ })).toBeVisible();
    expect(screen.getByText('papers support').nextElementSibling).toHaveTextContent('3');
    expect(screen.getByText('papers contradict').nextElementSibling).toHaveTextContent('2');
  });

  it('renders the summary without a mark when there is no key phrase', () => {
    const { container } = render(
      <VerdictBand
        verdict="Supported."
        summary={SUMMARY}
        supports={2}
        partial={0}
        contradicts={0}
      />,
    );
    expect(container.querySelector('mark')).toBeNull();
  });

  it('shows skeletons while loading', () => {
    render(<VerdictBand verdict="" summary="" supports={0} partial={0} contradicts={0} loading />);

    expect(screen.getByRole('region', { name: 'Verdict' })).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('Checking the evidence…')).toHaveClass('sr-only');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
