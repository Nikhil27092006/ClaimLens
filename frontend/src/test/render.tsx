import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderResult } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { MemoryRouter, RouterProvider, createMemoryRouter } from 'react-router-dom';
import { providerFuture, routerFuture, routes } from '@/app/router';
import { startDemoSession } from '@/features/auth/session';

/** Renders UI inside a MemoryRouter, for components that use Link/NavLink. */
export function renderWithRouter(ui: ReactElement, { route = '/' } = {}): RenderResult {
  return render(
    <MemoryRouter
      initialEntries={[route]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      {ui}
    </MemoryRouter>,
  );
}

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

export function QueryWrapper({ children, client }: { children: ReactNode; client: QueryClient }) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

/** Renders the whole app at `path` (with a demo session unless `signedIn` is false). */
export function renderApp(path: string, { signedIn = true } = {}) {
  if (signedIn) startDemoSession();
  const router = createMemoryRouter(routes, { initialEntries: [path], future: routerFuture });
  const client = createTestQueryClient();
  const result = render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} future={providerFuture} />
    </QueryClientProvider>,
  );
  return { ...result, router, client };
}
