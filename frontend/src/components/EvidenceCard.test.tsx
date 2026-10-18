import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithRouter } from '@/test/render';
import { EvidenceCard } from './EvidenceCard';

const EVIDENCE = {
  title: 'Low-Rank Adapters at Scale',
  n: 1,
  quote: 'On instruction-following suites, LoRA recovers 98–100% of full fine-tuning accuracy.',
  highlight: 'recovers 98–100% of full fine-tuning accuracy',
  page: 7,
  section: '§4.2 Results',
};

describe('EvidenceCard', () => {
  it('shows the paper, citation number, marked quote and page', async () => {
    const onOpen = vi.fn();
    render(<EvidenceCard {...EVIDENCE} stance="supports" onOpen={onOpen} />);

    expect(screen.getByRole('article')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: 'Low-Rank Adapters at Scale' }),
    ).toBeInTheDocument();
    expect(screen.getByText('[1]')).toHaveClass('text-support');
    expect(screen.getByText(EVIDENCE.highlight).tagName).toBe('MARK');
    expect(screen.getByText('p. 7 · §4.2 Results')).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: 'Open page 7 of Low-Rank Adapters at Scale' }),
    );
    expect(onOpen).toHaveBeenCalledOnce();
  });

  it('colours the citation for contradicting evidence and links to the page', () => {
    renderWithRouter(
      <EvidenceCard
        {...EVIDENCE}
        stance="contradicts"
        section={undefined}
        headingLevel={4}
        openTo="/ask?doc=DOC004&page=7"
      />,
    );

    expect(screen.getByText('[1]')).toHaveClass('text-contra');
    expect(screen.getByRole('heading', { level: 4 })).toBeInTheDocument();
    expect(screen.getByText('p. 7')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Open page 7/ })).toHaveAttribute(
      'href',
      '/ask?doc=DOC004&page=7',
    );
  });
});
