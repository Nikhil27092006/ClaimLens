import { Button } from './Button';

interface ErrorBannerProps {
  message: string;
  title?: string;
  /** API error code, e.g. "UPSTREAM_ERROR". */
  code?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

/**
 * Inline error with an optional retry. Not in the artboards; built from the same parts as the
 * failed state (contra square, mono label) so it reads as part of the desk.
 */
export function ErrorBanner({
  message,
  title = 'Something went wrong',
  code,
  onRetry,
  retryLabel = 'Try again',
}: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center gap-x-4 gap-y-3 border-1.5 border-contra bg-sheet px-5 py-4"
    >
      <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 bg-contra" />
      <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-1">
        <p className="font-mono text-label font-semibold uppercase text-contra">
          {code ? `${title} · ${code}` : title}
        </p>
        <p className="text-[15px] leading-[1.5] text-ink-2">{message}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
