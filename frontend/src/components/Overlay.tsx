import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/cn';
import { useFocusTrap } from '@/lib/useFocusTrap';

interface OverlayProps {
  onClose: () => void;
  /** id of the element that names the dialog. */
  labelledBy: string;
  /** dialog = centred box, drawer = right-side panel, sheet = full screen. */
  variant: 'dialog' | 'drawer' | 'sheet';
  /** Where focus goes back to on close (defaults to the element focused before opening). */
  returnFocusTo?: HTMLElement | null;
  children: ReactNode;
}

const PANEL: Record<OverlayProps['variant'], string> = {
  dialog: 'left-1/2 top-1/2 w-[min(440px,calc(100%-32px))] -translate-x-1/2 -translate-y-1/2',
  drawer: 'inset-y-0 right-0 w-full max-w-[576px] overflow-y-auto',
  sheet: 'inset-0 overflow-y-auto',
};

/** Modal layer: ink scrim, focus trapped inside, Esc or scrim click closes. */
export function Overlay({ onClose, labelledBy, variant, returnFocusTo, children }: OverlayProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(panelRef, true, onClose, returnFocusTo);

  useEffect(() => {
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div aria-hidden="true" className="absolute inset-0 bg-ink opacity-40" onClick={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className={cn('absolute', PANEL[variant])}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
