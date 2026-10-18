import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderApp } from '@/test/render';

describe('AskPage', () => {
  it('scopes to the chosen papers and answers with page citations', async () => {
    const user = userEvent.setup();
    renderApp('/ask?docs=DOC001,DOC002,DOC003');

    expect(await screen.findByText('[2] Quantized Adapters')).toBeInTheDocument();
    await user.click(
      screen.getByRole('button', {
        name: 'Does 4-bit quantization hurt adapter quality on reasoning tasks?',
      }),
    );

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Does 4-bit quantization hurt adapter quality on reasoning tasks?',
      }),
    ).toBeInTheDocument();
    expect(await screen.findByText('Answer · grounded in 3 papers')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Source 2, page 8' })).toHaveTextContent('[2 · p.8]');
    expect(screen.getByRole('button', { name: 'Source 3' })).toHaveTextContent('[3]');
    expect(screen.getByText('match 16-bit full fine-tuning').tagName).toBe('MARK');
    expect(screen.getByText('0.92')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('opens a citation in the evidence viewer and returns focus on Esc', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/ask?docs=DOC001,DOC002,DOC003');
    await user.click(
      await screen.findByRole('button', {
        name: 'Does 4-bit quantization hurt adapter quality on reasoning tasks?',
      }),
    );

    const chip = await screen.findByRole('button', { name: 'Source 2, page 8' });
    await user.click(chip);

    const viewer = await screen.findByRole('complementary', { name: 'Evidence viewer · [2]' });
    expect(within(viewer).getByText('Quantized Adapters for Open Models')).toBeInTheDocument();
    expect(await within(viewer).findByText(/§4 Results · chunk DOC002_CH042/)).toBeInTheDocument();
    expect(within(viewer).getByText('p. 8 / 26', { exact: false })).toBeInTheDocument();
    expect(router.state.location.search).toContain('page=8');

    await user.keyboard('{Escape}');
    expect(
      await screen.findByRole('complementary', { name: 'Evidence viewer' }),
    ).toBeInTheDocument();
    await waitFor(() => expect(chip).toHaveFocus());
  });

  it('sends a follow-up with Enter', async () => {
    const user = userEvent.setup();
    renderApp('/ask?docs=DOC001,DOC002,DOC003');

    const box = await screen.findByRole('textbox', { name: 'Ask a question' });
    await user.type(box, 'Which paper used the largest model?{Enter}');

    expect(await screen.findByText(/from 7B up to 65B parameters/)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Ask a follow-up' })).toHaveValue('');
  });
});
