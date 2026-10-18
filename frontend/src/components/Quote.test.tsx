import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Quote } from './Quote';

describe('Quote', () => {
  it('renders pre-split parts with the highlight marked', () => {
    const { container } = render(
      <Quote
        pre="Our 4-bit adapters "
        highlight="match 16-bit full fine-tuning"
        post=" on every benchmark."
      />,
    );

    const quote = container.querySelector('blockquote');
    expect(quote).toHaveTextContent(
      '“Our 4-bit adapters match 16-bit full fine-tuning on every benchmark.”',
      {
        normalizeWhitespace: false,
      },
    );
    expect(quote).toHaveClass('font-quote', 'italic', 'text-[17px]');
    expect(screen.getByText('match 16-bit full fine-tuning').tagName).toBe('MARK');
  });

  it('finds the highlight inside full text, ignoring case', () => {
    render(<Quote text="Pass@1 on HumanEval falls 9 points short." highlight="FALLS 9 POINTS" />);

    expect(screen.getByText('falls 9 points').tagName).toBe('MARK');
  });

  it('renders plain text when the highlight is not found', () => {
    const { container } = render(
      <Quote size="lg" text="Below rank 64, code accuracy drops sharply." highlight="rank 128" />,
    );

    expect(container.querySelector('mark')).toBeNull();
    expect(container.querySelector('blockquote')).toHaveTextContent(
      '“Below rank 64, code accuracy drops sharply.”',
    );
  });
});
