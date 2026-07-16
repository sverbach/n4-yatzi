import { useState, type ReactNode } from 'react';

interface TooltipProps {
  label: string;
  children: ReactNode;
}

export function Tooltip({ label, children }: TooltipProps) {
  const [open, setOpen] = useState(false);
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 z-50 mb-2 w-60 -translate-x-1/2
            rounded-[var(--r-md)] border-2 border-ink bg-surface px-3 py-2
            text-[11px] normal-case tracking-normal font-medium leading-snug
            text-text shadow-[var(--shadow-1)]"
        >
          {label}
        </span>
      )}
    </span>
  );
}
