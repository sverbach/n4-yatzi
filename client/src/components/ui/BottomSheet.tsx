import { useEffect, useRef, type ReactNode } from 'react';

interface BottomSheetProps {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: ReactNode;
}

/**
 * A bottom-anchored sheet built on the native <dialog> element (so it inherits
 * top-layer rendering, focus trapping, backdrop and Esc handling). The slide
 * animation lives in index.css under `.sheet-bottom`. `open` is mirrored into
 * showModal()/close() so React stays the single source of truth.
 */
export function BottomSheet({
  open,
  title,
  onClose,
  children,
}: BottomSheetProps) {
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
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className="sheet-bottom w-full max-w-[640px] rounded-t-[var(--r-lg)] border-2 border-b-0 border-ink bg-surface p-0 text-text shadow-[var(--shadow-1)]"
    >
      <div className="flex flex-col gap-4 p-5 pb-[max(20px,env(safe-area-inset-bottom))]">
        {/* grab handle */}
        <div className="mx-auto h-1 w-10 rounded-full bg-rule-mid" />

        <div className="flex items-center justify-between">
          <div className="text-[11px] font-bold tracking-[0.14em] text-accent-edge uppercase">
            {title ?? 'Menu'}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-text-soft transition-colors duration-[var(--dur-2)] [transition-timing-function:var(--ease)] hover:text-ink"
          >
            <span aria-hidden className="block text-lg leading-none">
              ×
            </span>
          </button>
        </div>

        {children}
      </div>
    </dialog>
  );
}
