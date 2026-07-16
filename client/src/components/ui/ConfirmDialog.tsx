import { useEffect, useRef, type ReactNode } from 'react';
import { Button } from './Button';

interface ConfirmDialogProps {
  open: boolean;
  eyebrow?: string;
  title: string;
  message: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Confirmation modal built on the native <dialog> element. `showModal()` gives
 * us the top-layer render, focus trapping, backdrop and Esc handling for free;
 * we mirror the native open/close into the controlled `open` prop so React
 * stays the single source of truth.
 */
export function ConfirmDialog({
  open,
  eyebrow,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      // Esc fires `cancel`; route it through our state instead of letting the
      // dialog close itself, so `open` never drifts out of sync.
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      // A click whose target is the dialog itself landed on the backdrop.
      onClick={(e) => {
        if (e.target === ref.current) onCancel();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-[400px] rounded-[var(--r-lg)] border-2 border-ink bg-surface p-0 text-text shadow-[var(--shadow-1)] backdrop:bg-[rgba(0,0,0,0.5)] backdrop:backdrop-blur-[2px]"
    >
      <div className="flex flex-col gap-5 p-6">
        <div>
          {eyebrow && (
            <div className="text-[11px] font-bold tracking-[0.14em] text-accent-edge uppercase">
              {eyebrow}
            </div>
          )}
          <div className="t-display mt-1 text-[22px] leading-tight">
            {title}
          </div>
        </div>
        <p className="m-0 text-[13px] leading-relaxed text-text-soft">
          {message}
        </p>
        <div className="flex justify-end gap-2.5">
          <Button variant="outline" size="sm" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant="accent" size="sm" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
