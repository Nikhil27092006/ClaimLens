import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StatusTag } from './StatusTag';

describe('StatusTag', () => {
  it.each([
    ['SUPPORTED', 'Supported', ['bg-support', 'text-on-status']],
    ['CONTRADICTED', 'Contradicted', ['bg-contra', 'text-on-status']],
    ['PARTIALLY_SUPPORTED', 'Partial', ['border-partial', 'text-partial']],
    ['INSUFFICIENT_EVIDENCE', 'Insufficient', ['border-dashed', 'border-insufficient']],
  ] as const)('shows %s with a word, not colour alone', (status, label, classes) => {
    render(<StatusTag status={status} />);

    const tag = screen.getByText(label);
    expect(tag).toHaveClass('uppercase', ...classes);
  });
});
