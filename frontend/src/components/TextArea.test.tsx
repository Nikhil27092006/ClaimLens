import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { TextArea } from './TextArea';

describe('TextArea', () => {
  it('associates the label and accepts typing', async () => {
    render(<TextArea label="Notes" rows={3} />);

    const field = screen.getByRole('textbox', { name: 'Notes' });
    await userEvent.type(field, 'Check rank ablations');
    expect(field).toHaveValue('Check rank ablations');
  });

  it('renders the claim variant in display type with a hidden label', () => {
    render(<TextArea label="Claim" hideLabel variant="claim" defaultValue="LoRA matches…" />);

    const field = screen.getByRole('textbox', { name: 'Claim' });
    expect(field).toHaveClass(
      'font-display',
      'md:text-claim',
      'border-dashed',
      'border-rule-dashed',
    );
    expect(screen.getByText('Claim')).toHaveClass('sr-only');
  });

  it('marks errors', () => {
    render(<TextArea label="Claim" error="Enter a claim to check." />);

    const field = screen.getByRole('textbox', { name: 'Claim' });
    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(field).toHaveAccessibleDescription('Enter a claim to check.');
    expect(field).toHaveClass('border-contra');
  });
});
