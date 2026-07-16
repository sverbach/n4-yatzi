import type { ReactNode } from 'react';

interface CardProps {
  eyebrow?: string;
  title?: string;
  raised?: boolean;
  children: ReactNode;
}

export function Card({ eyebrow, title, raised = false, children }: CardProps) {
  return (
    <div
      className={
        'bg-surface border-2 border-ink rounded-[var(--r-lg)] p-6 ' +
        (raised ? 'shadow-[var(--shadow-card)]' : '')
      }
    >
      {(eyebrow || title) && (
        <div className="mb-5">
          {eyebrow && (
            <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent-edge">
              {eyebrow}
            </div>
          )}
          {title && (
            <div className="t-display text-[28px] leading-tight mt-1">
              {title}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
