import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  it('is a decorative square block with a reduced-motion-safe pulse', () => {
    const { container } = render(<Skeleton width="60%" height={61} />);

    const block = container.firstElementChild;
    expect(block).toHaveAttribute('aria-hidden', 'true');
    expect(block).toHaveClass('bg-grid', 'motion-safe:animate-pulse');
    expect(block).toHaveStyle({ width: '60%', height: '61px' });
  });

  it('has an ink tone for dark panels', () => {
    const { container } = render(<Skeleton tone="ink" />);
    expect(container.firstElementChild).toHaveClass('bg-rule-on-ink');
  });
});
