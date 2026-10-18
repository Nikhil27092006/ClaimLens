import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { ApiError, apiFetch, apiUrl } from './client';
import type { ApiErrorBody, Job, JobStep } from './types';

export type JobStatus = 'idle' | 'running' | 'done' | 'error';

export interface JobStreamState<T> {
  status: JobStatus;
  steps: JobStep[];
  result?: T;
  error?: ApiError;
}

const IDLE: JobStreamState<never> = { status: 'idle', steps: [] };

/** Query-cache key holding a finished job, so revisiting a screen does not re-run it. */
export const jobKey = (jobId: string) => ['job', jobId] as const;

const POLL_INTERVAL_MS = 2000;

function toError(body: ApiErrorBody | undefined): ApiError {
  return new ApiError(body?.code ?? 'INTERNAL_ERROR', body?.message ?? 'The job failed.', 0);
}

interface Options {
  /** Polling interval for the fallback path (tests shorten it). */
  pollInterval?: number;
}

/**
 * Follows a job: `step` events append to `steps`, then `done` carries the result or `error`
 * the failure. If the stream cannot be opened or drops, falls back to polling GET /jobs/{id}.
 * The stream is closed on unmount or when `jobId` changes.
 */
export function useJobStream<T>(
  jobId: string | null | undefined,
  { pollInterval = POLL_INTERVAL_MS }: Options = {},
): JobStreamState<T> {
  const queryClient = useQueryClient();
  // Tagged with its job so a new jobId never shows the previous job's result for a render.
  const [state, setState] = useState<{ jobId: string | null; value: JobStreamState<T> }>({
    jobId: null,
    value: IDLE,
  });

  useEffect(() => {
    if (!jobId) return;
    const cached = queryClient.getQueryData<JobStreamState<T>>(jobKey(jobId));
    if (cached?.status === 'done') {
      setState({ jobId, value: cached });
      return;
    }

    let closed = false;
    let source: EventSource | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const controller = new AbortController();
    const steps: JobStep[] = [];
    const update = (value: JobStreamState<T>) => setState({ jobId, value });
    update({ status: 'running', steps: [] });

    const finish = (next: JobStreamState<T>) => {
      if (closed) return;
      closed = true;
      source?.close();
      clearTimeout(timer);
      update(next);
      if (next.status === 'done') queryClient.setQueryData(jobKey(jobId), next);
    };

    const poll = async () => {
      try {
        const job = await apiFetch<Job<T>>(`/jobs/${jobId}`, { signal: controller.signal });
        if (closed) return;
        if (job.status === 'done')
          finish({ status: 'done', steps: [...steps], result: job.result });
        else if (job.status === 'error')
          finish({ status: 'error', steps: [...steps], error: toError(job.error) });
        else timer = setTimeout(() => void poll(), pollInterval);
      } catch (error) {
        if (closed || controller.signal.aborted) return;
        finish({
          status: 'error',
          steps: [...steps],
          error: error instanceof ApiError ? error : toError(undefined),
        });
      }
    };

    if (typeof EventSource === 'undefined') {
      void poll();
    } else {
      source = new EventSource(apiUrl(`/jobs/${jobId}/stream`));
      source.addEventListener('step', (event) => {
        steps.push(JSON.parse((event as MessageEvent<string>).data) as JobStep);
        if (!closed) update({ status: 'running', steps: [...steps] });
      });
      source.addEventListener('done', (event) => {
        const { result } = JSON.parse((event as MessageEvent<string>).data) as { result: T };
        finish({ status: 'done', steps: [...steps], result });
      });
      source.addEventListener('error', (event) => {
        // A server-sent `event: error` carries data; a plain Event means the connection failed.
        if (event instanceof MessageEvent && typeof event.data === 'string' && event.data) {
          const { error } = JSON.parse(event.data) as { error?: ApiErrorBody };
          finish({ status: 'error', steps: [...steps], error: toError(error) });
          return;
        }
        source?.close();
        source = null;
        if (!closed) void poll();
      });
    }

    return () => {
      closed = true;
      source?.close();
      clearTimeout(timer);
      controller.abort();
    };
  }, [jobId, pollInterval, queryClient]);

  if (!jobId) return IDLE;
  if (state.jobId === jobId) return state.value;
  const cached = queryClient.getQueryData<JobStreamState<T>>(jobKey(jobId));
  return cached?.status === 'done' ? cached : { status: 'running', steps: [] };
}
