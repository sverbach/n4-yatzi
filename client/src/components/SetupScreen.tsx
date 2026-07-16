import type { KeyboardEvent } from 'react';
import { useGameStore } from '../store/gameStore';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Divider } from './ui/Divider';

export function SetupScreen() {
  const players = useGameStore((s) => s.players);
  const newPlayerName = useGameStore((s) => s.newPlayerName);
  const setNewPlayerName = useGameStore((s) => s.setNewPlayerName);
  const addPlayer = useGameStore((s) => s.addPlayer);
  const removePlayer = useGameStore((s) => s.removePlayer);
  const startGame = useGameStore((s) => s.startGame);

  const addDisabled = newPlayerName.trim().length === 0 || players.length >= 6;
  const startDisabled = players.length < 1;

  const handleNameKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') addPlayer();
  };

  return (
    <div className="flex min-h-[calc(100dvh-96px)] items-center justify-center">
      <div className="w-full max-w-[520px]">
        <Card eyebrow="PASS & PLAY · UP TO 6" title="Yatzy" raised>
          <div className="flex flex-col gap-5 pt-1">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Player name"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  onKeyDown={handleNameKey}
                  aria-label="Player name"
                />
              </div>
              <Button
                variant="accent"
                disabled={addDisabled}
                onClick={addPlayer}
              >
                Add player
              </Button>
            </div>

            {players.length > 0 && (
              <div className="flex flex-col gap-2">
                {players.map((p, i) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-3 rounded-[var(--r-sm)]
                    border border-rule-soft bg-surface px-3 py-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex h-6 w-6 items-center justify-center rounded-[var(--r-sm)]
                        bg-ink text-bg text-xs font-bold"
                      >
                        {i + 1}
                      </div>
                      <span className="text-[15px] font-medium text-ink">
                        {p.name}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removePlayer(p.id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {players.length === 0 && (
              <div className="py-3 text-center text-[13px] text-muted">
                Add at least one player to start.
              </div>
            )}

            <Divider />

            <Button
              variant="primary"
              size="lg"
              block
              disabled={startDisabled}
              onClick={startGame}
            >
              Start game
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
