import { pipPattern } from '../game/scoring';

interface DieProps {
  value: number;
  held: boolean;
  canHold: boolean;
  onToggle: () => void;
}

export function Dice({ value, held, canHold, onToggle }: DieProps) {
  const pips = pipPattern(value);
  return (
    <div
      onClick={onToggle}
      role="button"
      aria-pressed={held}
      aria-label={`Die showing ${value}${held ? ', held' : ''}`}
      className="grid h-[52px] w-[52px] grid-cols-3 grid-rows-3 gap-[5px] rounded-[var(--r-md)]
        border-2 p-[9px] transition-all duration-[var(--dur-2)] [transition-timing-function:var(--ease)]"
      style={{
        borderColor: held ? 'var(--accent-line)' : 'var(--ink)',
        background: held ? 'var(--accent-wash)' : 'var(--surface)',
        cursor: canHold ? 'pointer' : 'default',
        transform: held ? 'translateY(-3px)' : 'none',
        boxShadow: held ? 'var(--shadow-accent)' : 'var(--shadow-1)',
      }}
    >
      {pips.map((on, i) => (
        <div
          key={i}
          className="rounded-[var(--r-full)]"
          style={{ background: on ? 'var(--ink)' : 'transparent' }}
        />
      ))}
    </div>
  );
}
