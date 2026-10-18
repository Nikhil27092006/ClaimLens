import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { AppProviders } from '@/app/providers';
import { providerFuture, routerFuture, routes } from '@/app/router';
import { env } from '@/lib/env';
import '@/styles/tokens.css';
import '@/styles/index.css';

async function start() {
  // VITE_USE_MOCKS=true: answer every API call from the MSW mock server in this tab.
  if (env.useMocks) {
    const { startMockApi } = await import('@/mocks/browser');
    await startMockApi();
  }

  const router = createBrowserRouter(routes, { future: routerFuture });
  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error('Missing #root element in index.html');

  createRoot(rootElement).render(
    <StrictMode>
      <AppProviders>
        <RouterProvider router={router} future={providerFuture} />
      </AppProviders>
    </StrictMode>,
  );
}

void start();
