import type { InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = '', ...rest }: InputProps) {
  return (
    <input
      className={
        'w-full h-10 px-3 font-mono text-sm text-ink bg-inset ' +
        'border-2 border-ink rounded-[var(--r-md)] outline-none ' +
        'placeholder:text-muted placeholder:uppercase placeholder:tracking-[0.05em] placeholder:text-xs ' +
        'focus:border-accent transition-colors duration-[var(--dur-2)] ' +
        className
      }
      {...rest}
    />
  );
}
