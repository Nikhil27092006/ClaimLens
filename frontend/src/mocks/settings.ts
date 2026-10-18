// Mock API toggles. In the browser, add ?mock=error, ?mock=slow or ?mock=error,slow to any URL;
// the choice is kept for the browser session. ?mock= (empty) resets it.

export interface MockSettings {
  /** normal = 300–900 ms per streamed step, slow = 4×, none = instant (tests). */
  latency: 'normal' | 'slow' | 'none';
  /** Jobs stream three steps, then fail with UPSTREAM_ERROR. */
  failJobs: boolean;
}

export const mockSettings: MockSettings = { latency: 'normal', failJobs: false };

const STORAGE_KEY = 'claimlens:mock';

export function loadMockSettings(): void {
  let value: string | null = null;
  try {
    const param = new URLSearchParams(window.location.search).get('mock');
    if (param !== null) sessionStorage.setItem(STORAGE_KEY, param);
    value = sessionStorage.getItem(STORAGE_KEY);
  } catch {
    // Storage can be unavailable (private mode); fall back to defaults.
  }
  const flags = new Set((value ?? '').split(',').map((flag) => flag.trim()));
  mockSettings.latency = flags.has('slow') ? 'slow' : 'normal';
  mockSettings.failJobs = flags.has('error');
}

export function scaledDelay(ms: number): number {
  if (mockSettings.latency === 'none') return 0;
  return mockSettings.latency === 'slow' ? ms * 4 : ms;
}

export const wait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, scaledDelay(ms)));
