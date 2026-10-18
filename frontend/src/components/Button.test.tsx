import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithRouter } from '@/test/render';
import { Button, ButtonLink } from './Button';

describe('Button', () => {
  it('renders a type="button" by default and handles clicks', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Re-check claim →</Button>);

    const button = screen.getByRole('button', { name: 'Re-check claim →' });
    expect(button).toHaveAttribute('type', 'button');
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('applies the variant and its default size', () => {
    render(
      <>
        <Button variant="secondary">Edit sources</Button>
        <Button variant="marker-cta">Try the live demo</Button>
        <Button variant="ghost-on-ink">← p.7</Button>
      </>,
    );

    expect(screen.getByRole('button', { name: 'Edit sources' })).toHaveClass('min-h-11');
    expect(screen.getByRole('button', { name: 'Try the live demo' })).toHaveClass(
      'bg-marker',
      'shadow-hard',
      'min-h-14',
    );
    expect(screen.getByRole('button', { name: '← p.7' })).toHaveClass('min-h-9', 'text-on-ink');
  });

  it('stays focusable but inert while loading', async () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Checking…
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Checking…' });
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toBeEnabled();
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('can be disabled', () => {
    render(<Button disabled>Compare 3 selected</Button>);
    expect(screen.getByRole('button', { name: 'Compare 3 selected' })).toBeDisabled();
  });
});

describe('ButtonLink', () => {
  it('renders a link styled as a button', () => {
    renderWithRouter(<ButtonLink to="/ask?docs=DOC001">Ask across 3 papers →</ButtonLink>);

    const link = screen.getByRole('link', { name: 'Ask across 3 papers →' });
    expect(link).toHaveAttribute('href', '/ask?docs=DOC001');
    expect(link).toHaveClass('bg-ink', 'text-marker', 'no-underline');
  });
});
