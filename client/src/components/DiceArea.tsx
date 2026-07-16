import { useGameStore } from '../store/gameStore';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Tooltip } from './ui/Tooltip';
import { Dice } from './Dice';

export function DiceArea() {
  const players = useGameStore((s) => s.players);
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex);
  const dice = useGameStore((s) => s.dice);
  const held = useGameStore((s) => s.held);
  const rollsLeft = useGameStore((s) => s.rollsLeft);
  const rolling = useGameStore((s) => s.rolling);
  const history = useGameStore((s) => s.history);
  const rollDice = useGameStore((s) => s.rollDice);
  const revertRoll = useGameStore((s) => s.revertRoll);
  const toggleHold = useGameStore((s) => s.toggleHold);

  const currentPlayer = players[currentPlayerIndex];
  const canHold = rollsLeft !== 3 && !rolling;

  return (
    <div className="flex flex-col items-center gap-5 px-0 pb-1 pt-3">
      <div className="flex items-center gap-2.5">
        <span className="text-[13px] uppercase tracking-[0.08em] text-text-soft">
          Now rolling
        </span>
        <Badge variant="accent">{currentPlayer?.name ?? ''}</Badge>
        <Tooltip label="Click dice to hold them between rolls. Once you've rolled, pick a highlighted category in the sheet above to score your turn.">
          <span
            className="flex h-[18px] w-[18px] cursor-help items-center justify-center
              rounded-[var(--r-full)] border-[1.5px] border-muted text-[11px] font-bold text-text-soft"
          >
            i
          </span>
        </Tooltip>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        {dice.map((v, i) => (
          <Dice
            key={i}
            value={v}
            held={held[i]}
            canHold={canHold}
            onToggle={() => toggleHold(i)}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Button
          variant="accent"
          size="lg"
          disabled={rollsLeft <= 0 || rolling}
          onClick={rollDice}
        >
          {rolling ? 'Rolling…' : 'Roll dice'}
        </Button>
        <span className="text-[13px] text-text-soft">
          Rolls left: {rollsLeft}/3
        </span>
        <Button
          variant="ghost"
          size="sm"
          disabled={rolling || history.length === 0}
          onClick={revertRoll}
        >
          Revert
        </Button>
      </div>
    </div>
  );
}
