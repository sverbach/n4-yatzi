import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'accent' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  children: ReactNode;
}

const base =
  'inline-flex items-center justify-center font-mono uppercase tracking-[0.06em] ' +
  'font-bold select-none whitespace-nowrap transition-all duration-[var(--dur-2)] ' +
  '[transition-timing-function:var(--ease)] rounded-[var(--r-md)] ' +
  'disabled:opacity-40 disabled:pointer-events-none cursor-pointer';

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-[11px]',
  md: 'h-10 px-4 text-xs',
  lg: 'h-11 px-5 text-sm',
};

const variants: Record<Variant, string> = {
  primary:
    'bg-ink text-bg border-2 border-ink hover:brightness-110 active:translate-y-px',
  accent:
    'bg-accent text-accent-ink border-2 border-accent hover:brightness-105 active:translate-y-px',
  outline:
    'bg-transparent text-ink border-2 border-ink hover:bg-ink/5 active:translate-y-px',
  ghost:
    'bg-transparent text-text-soft border-2 border-transparent hover:text-ink hover:bg-ink/5',
};

export function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${block ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
