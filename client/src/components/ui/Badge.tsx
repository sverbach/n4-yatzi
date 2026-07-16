import type { ReactNode } from 'react';

interface BadgeProps {
  variant?: 'accent' | 'neutral';
  children: ReactNode;
}

export function Badge({ variant = 'neutral', children }: BadgeProps) {
  const styles =
    variant === 'accent'
      ? 'bg-accent text-accent-ink border-accent'
      : 'bg-surface-2 text-ink border-rule-mid';
  return (
    <span
      className={
        'inline-flex items-center h-6 px-2.5 rounded-[var(--r-full)] border ' +
        'font-mono text-[11px] font-bold uppercase tracking-[0.06em] ' +
        styles
      }
    >
      {children}
    </span>
  );
}
