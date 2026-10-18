import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';
import { loadMockSettings } from './settings';

/** Starts the mock API in the browser (VITE_USE_MOCKS=true). */
export async function startMockApi(): Promise<void> {
  loadMockSettings();
  await setupWorker(...handlers).start({
    onUnhandledRequest: 'bypass',
    quiet: true,
  });
}
