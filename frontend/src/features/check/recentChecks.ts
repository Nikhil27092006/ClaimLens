import { useSyncExternalStore } from 'react';
import type { CheckResult, JobStep } from '@/api/types';

/** A check kept for the session, so it can be reopened from "Recent checks". */
export interface RecentCheck {
  jobId: string;
  claim: string;
  startedAt: string;
  steps?: JobStep[];
  result?: CheckResult;
}

const STORAGE_KEY = 'claimlens:recent-checks';
const CHANGE_EVENT = 'claimlens:recent-checks-change';
const LIMIT = 5;

function readRaw(): string {
  try {
    return sessionStorage.getItem(STORAGE_KEY) ?? '[]';
  } catch {
    return '[]';
  }
}

export function readRecentChecks(): RecentCheck[] {
  try {
    const parsed = JSON.parse(readRaw()) as unknown;
    return Array.isArray(parsed) ? (parsed as RecentCheck[]) : [];
  } catch {
    return [];
  }
}

function write(checks: RecentCheck[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(checks.slice(0, LIMIT)));
  } catch {
    // Storage full or unavailable: recent checks are a convenience only.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Adds a check to the front (newest first), keeping the last five. */
export function addRecentCheck(check: RecentCheck) {
  write([check, ...readRecentChecks().filter((c) => c.jobId !== check.jobId)]);
}

/** Stores the finished result and trace of a check already in the list. */
export function completeRecentCheck(jobId: string, result: CheckResult, steps: JobStep[]) {
  const checks = readRecentChecks();
  if (!checks.some((c) => c.jobId === jobId)) return;
  write(checks.map((c) => (c.jobId === jobId ? { ...c, result, steps } : c)));
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => window.removeEventListener(CHANGE_EVENT, onChange);
}

export function useRecentChecks(): RecentCheck[] {
  const raw = useSyncExternalStore(subscribe, readRaw, () => '[]');
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as RecentCheck[]) : [];
  } catch {
    return [];
  }
}
