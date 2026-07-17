import { useGameStore } from '../store/gameStore';
import { Button } from './ui/Button';
import { Dice } from './Dice';

export function DiceArea() {
  const players = useGameStore((s) => s.players);
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex);
  const dice = useGameStore((s) => s.dice);
  const held = useGameStore((s) => s.held);
  const rollsLeft = useGameStore((s) => s.rollsLeft);
  const rolling = useGameStore((s) => s.rolling);
  const rollDice = useGameStore((s) => s.rollDice);
  const toggleHold = useGameStore((s) => s.toggleHold);

  const currentPlayer = players[currentPlayerIndex];
  const canHold = rollsLeft !== 3 && !rolling;

  return (
    <div className="flex flex-col items-center gap-5 px-0 pb-1 pt-3">
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

      <div className="w-full flex flex-col gap-2">
        <Button
          variant="accent"
          size="lg"
          block
          disabled={rollsLeft <= 0 || rolling}
          onClick={rollDice}
        >
          {rolling ? 'Rolling…' : `Roll dice (${rollsLeft} left)`}
        </Button>

        <div className="flex w-full items-center justify-between gap-2.5 ps-1">
          <div className="flex items-center gap-2.5">
            <span className="text-[12px] uppercase tracking-[0.08em] text-text-soft">
              Now rolling:
            </span>
            <span className="text-accent text-[12px]">
              {currentPlayer?.name ?? ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
