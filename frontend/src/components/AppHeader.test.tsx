import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithRouter } from '@/test/render';
import { AppHeader } from './AppHeader';
import { Logo } from './Logo';
import { PageContainer } from './PageContainer';

const ITEMS = [
  { index: '01', label: 'Check', to: '/', end: true },
  { index: '02', label: 'Library', to: '/library' },
];

describe('AppHeader', () => {
  it('renders the logo, nav with the active item, model status and account button', () => {
    renderWithRouter(<AppHeader items={ITEMS} />, { route: '/library' });

    expect(screen.getByRole('link', { name: 'ClaimLens' })).toHaveAttribute('href', '/');
    const nav = screen.getByRole('navigation', { name: 'Main' });
    expect(nav).toHaveTextContent('01 Check02 Library');
    expect(screen.getByRole('link', { name: 'Library' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Library' })).toHaveClass('bg-ink', 'text-marker');
    expect(screen.getByRole('link', { name: 'Check' })).not.toHaveAttribute('aria-current');
    expect(screen.getByText(/Nemotron 3 · Token Factory/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Account' })).toHaveTextContent('AC');
  });
});

describe('Logo', () => {
  it('links home with the wordmark as its name', () => {
    renderWithRouter(<Logo />);
    const link = screen.getByRole('link', { name: 'ClaimLens' });
    expect(link).toHaveClass('text-ink');
    expect(link.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('has a light variant for dark panels', () => {
    renderWithRouter(<Logo onInk />);
    expect(screen.getByRole('link', { name: 'ClaimLens' })).toHaveClass('text-on-ink');
  });
});

describe('PageContainer', () => {
  it('wraps content in the 1320px page column', () => {
    renderWithRouter(<PageContainer>Content</PageContainer>);
    expect(screen.getByText('Content')).toHaveClass('max-w-layout', 'gap-6');
  });
});
