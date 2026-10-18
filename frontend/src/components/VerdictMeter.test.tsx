import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { VerdictMeter } from './VerdictMeter';

describe('VerdictMeter', () => {
  it('is one image with the counts in its label and one segment per paper', () => {
    render(<VerdictMeter supports={3} partial={1} contradicts={2} />);

    const meter = screen.getByRole('img', {
      name: 'Evidence balance: 3 support, 1 partial, 2 contradict',
    });
    expect(meter.children).toHaveLength(6);
    expect(meter.querySelectorAll('.bg-support')).toHaveLength(3);
    expect(meter.querySelectorAll('.hatch-partial')).toHaveLength(1);
    expect(meter.querySelectorAll('.bg-contra')).toHaveLength(2);
  });

  it('uses the small hatch in the compact size', () => {
    render(<VerdictMeter supports={1} partial={1} contradicts={0} size="sm" />);
    expect(screen.getByRole('img').querySelectorAll('.hatch-partial-sm')).toHaveLength(1);
  });

  it('shows an empty dashed bar when there is no evidence', () => {
    render(<VerdictMeter supports={0} partial={0} contradicts={0} />);

    const meter = screen.getByRole('img', {
      name: 'Evidence balance: no supporting or contradicting papers',
    });
    expect(meter.children).toHaveLength(1);
  });
});
