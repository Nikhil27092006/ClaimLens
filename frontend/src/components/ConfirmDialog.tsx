import { useId } from 'react';
import { Button } from './Button';
import { Overlay } from './Overlay';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  busy?: boolean;
}

/** In-page confirmation (never window.confirm). Cancel gets focus first. */
export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
  busy = false,
}: ConfirmDialogProps) {
  const titleId = useId();
  return (
    <Overlay variant="dialog" labelledBy={titleId} onClose={onCancel}>
      <div className="flex flex-col gap-4 border-1.5 border-ink bg-sheet p-6">
        <h2 id={titleId} className="font-display text-[24px] font-bold tracking-[-0.5px]">
          {title}
        </h2>
        <p className="text-[15px] leading-[1.5] text-ink-2">{message}</p>
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary-sheet" onClick={onConfirm} loading={busy}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Overlay>
  );
}
