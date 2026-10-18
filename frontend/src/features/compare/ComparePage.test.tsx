import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderApp } from '@/test/render';

describe('ComparePage', () => {
  it('shows the attribute × paper table with differing rows marked', async () => {
    renderApp('/compare?docs=DOC001,DOC002,DOC003');

    const table = await screen.findByRole('table');
    expect(screen.getByText('3 papers · 6 attributes')).toBeInTheDocument();
    expect(
      within(table).getByRole('columnheader', { name: /Quantized Adapters for Open Models/ }),
    ).toBeInTheDocument();
    expect(within(table).getAllByText('differs')).toHaveLength(4);
    expect(within(table).getByRole('rowheader', { name: 'Metric' })).not.toHaveTextContent(
      'differs',
    );
    expect(within(table).getByText('7B to 65B')).toBeInTheDocument();
  });

  it('hides the markers when Highlight differences is off', async () => {
    const user = userEvent.setup();
    renderApp('/compare?docs=DOC001,DOC002,DOC003');
    await screen.findByRole('table');

    await user.click(screen.getByRole('checkbox', { name: 'Highlight differences' }));
    expect(screen.queryByText('differs')).not.toBeInTheDocument();
  });

  it('opens a cell’s page in the evidence drawer', async () => {
    const user = userEvent.setup();
    renderApp('/compare?docs=DOC001,DOC002,DOC003');
    await screen.findByRole('table');

    await user.click(
      screen.getByRole('button', {
        // The visually hidden suffix may be joined with a space: "p.6 · §4 , open in …".
        name: /^p\.6 · §4\s*, open in Quantized Adapters for Open Models$/,
      }),
    );
    expect(await screen.findByRole('dialog', { name: 'Evidence viewer' })).toBeInTheDocument();
  });

  it('asks for two papers when fewer are ready', async () => {
    renderApp('/compare?docs=DOC001');
    expect(
      await screen.findByRole('heading', { name: 'Select at least two ready papers' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Go to Library' })).toHaveAttribute('href', '/library');
  });
});
