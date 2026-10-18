import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderApp } from '@/test/render';

describe('ConflictsPage', () => {
  it('shows each conflict with both quotes, the status and why', async () => {
    renderApp('/conflicts?docs=DOC001,DOC002,DOC003,DOC004');

    expect(
      await screen.findByRole('heading', {
        name: 'Does LoRA close the gap with full fine-tuning on code?',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('4 papers · 3 conflicts found')).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(3);
    expect(
      screen.getByRole('button', { name: /A · Low-Rank Adapters at Scale · p.7/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /B · Rank Matters More Than You Think · p.11/ }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Different benchmarks: A never evaluates code/)).toBeInTheDocument();
  });

  it('filters by status with aria-pressed buttons', async () => {
    const user = userEvent.setup();
    renderApp('/conflicts?docs=DOC001,DOC002,DOC003,DOC004');
    await screen.findAllByRole('article');

    const partial = screen.getByRole('button', { name: 'Partial · 1' });
    await user.click(partial);

    expect(partial).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'All · 3' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(screen.getAllByRole('article')).toHaveLength(1);
    expect(
      screen.getByRole('heading', { name: 'Do adapters forget less of the base model?' }),
    ).toBeInTheDocument();
  });

  it('opens a quote’s page in the evidence drawer', async () => {
    const user = userEvent.setup();
    renderApp('/conflicts?docs=DOC001,DOC002,DOC003,DOC004');

    await user.click(
      await screen.findByRole('button', { name: /B · Rank Matters More Than You Think/ }),
    );
    expect(await screen.findByRole('dialog', { name: 'Evidence viewer' })).toBeInTheDocument();
    expect(
      screen.getByText('Rank Matters More Than You Think', { selector: 'p' }),
    ).toBeInTheDocument();
  });

  it('re-runs the search for a topic', async () => {
    const user = userEvent.setup();
    renderApp('/conflicts?docs=DOC001,DOC002,DOC003,DOC004');
    await screen.findAllByRole('article');

    await user.click(screen.getByRole('button', { name: 'Narrow by topic' }));
    await user.type(screen.getByRole('textbox', { name: 'Topic' }), 'forgetting');
    await user.click(screen.getByRole('button', { name: 'Re-run' }));

    expect(await screen.findByText(/topic: forgetting/)).toBeInTheDocument();
    expect(await screen.findByText(/1 conflict found/)).toBeInTheDocument();
  });
});
