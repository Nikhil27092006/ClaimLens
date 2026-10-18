import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { TextInput } from './TextInput';

describe('TextInput', () => {
  it('associates the visible label with the input', async () => {
    render(<TextInput label="Email" type="email" placeholder="you@university.edu" />);

    const input = screen.getByLabelText('Email');
    expect(screen.getByText('Email')).toBeVisible();
    await userEvent.type(input, 'ada@lab.org');
    expect(input).toHaveValue('ada@lab.org');
  });

  it('describes the input with its hint and error', () => {
    render(
      <TextInput
        label="Max papers"
        hint="Between 3 and 10."
        error="Choose between 3 and 10 papers."
      />,
    );

    const input = screen.getByLabelText('Max papers');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Between 3 and 10. Choose between 3 and 10 papers.');
  });

  it('keeps a hidden label accessible and renders a label action', () => {
    render(
      <>
        <TextInput label="Claim" hideLabel />
        <TextInput label="Password" labelAction={<a href="#forgot">Forgot?</a>} />
      </>,
    );

    expect(screen.getByLabelText('Claim')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Forgot?' })).toBeInTheDocument();
  });
});
