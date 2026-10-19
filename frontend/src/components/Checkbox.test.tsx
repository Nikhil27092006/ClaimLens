import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('toggles via its label', async () => {
    render(<Checkbox label="Highlight differences" boxed />);

    const box = screen.getByRole('checkbox', { name: 'Highlight differences' });
    expect(box).not.toBeChecked();
    await userEvent.click(screen.getByText('Highlight differences'));
    expect(box).toBeChecked();
  });

  it('keeps a hidden label as the accessible name', () => {
    render(<Checkbox label="Select Low-Rank Adapters at Scale" hideLabel defaultChecked />);

    expect(
      screen.getByRole('checkbox', { name: 'Select Low-Rank Adapters at Scale' }),
    ).toBeChecked();
  });
});
