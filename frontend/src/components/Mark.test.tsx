import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Mark } from './Mark';

describe('Mark', () => {
  it('renders a <mark> element', () => {
    render(
      <p>
        The literature splits on <Mark>which benchmarks count</Mark>.
      </p>,
    );

    expect(screen.getByText('which benchmarks count').tagName).toBe('MARK');
  });
});
