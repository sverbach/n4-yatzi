import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useGameStore } from '../store/gameStore';
import { totalsFor } from '../game/scoring';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Divider } from './ui/Divider';

// Solarized-flavored festive palette for the celebration.
const CONFETTI_COLORS = [
  '#2aa198',
  '#b58900',
  '#d33682',
  '#268bd2',
  '#859900',
  '#cb4b16',
];

export function ResultsScreen() {
  const players = useGameStore((s) => s.players);
  const newGame = useGameStore((s) => s.newGame);

  // Celebrate on mount — two streams from the bottom corners for ~1.5s.
  // Skipped when the user prefers reduced motion.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const end = Date.now() + 1500;
    let raf = 0;
    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 60,
        startVelocity: 55,
        origin: { x: 0, y: 1 },
        colors: CONFETTI_COLORS,
        disableForReducedMotion: true,
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 60,
        startVelocity: 55,
        origin: { x: 1, y: 1 },
        colors: CONFETTI_COLORS,
        disableForReducedMotion: true,
      });
      if (Date.now() < end) raf = requestAnimationFrame(frame);
    };
    frame();

    return () => {
      cancelAnimationFrame(raf);
      confetti.reset();
    };
  }, []);

  const ranked = [...players]
    .map((p) => ({ name: p.name, total: totalsFor(p.scores).total }))
    .sort((a, b) => b.total - a.total)
    .map((p, i) => ({ ...p, rank: i + 1, isWinner: i === 0 }));

  return (
    <div className="flex min-h-[calc(100dvh-96px)] items-center justify-center">
      <div className="w-full max-w-[520px]">
        <Card eyebrow="GAME OVER" title="Final results" raised>
          <div className="flex flex-col gap-5 pt-1">
            <div className="flex flex-col gap-2">
              {ranked.map((rp) => (
                <div
                  key={`${rp.rank}-${rp.name}`}
                  className="flex items-center justify-between gap-3 rounded-[var(--r-sm)]
                  border border-rule-soft px-3.5 py-2.5"
                  style={{
                    background: rp.isWinner
                      ? 'var(--accent-wash)'
                      : 'var(--surface)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 text-sm font-bold text-ink">
                      {rp.rank}
                    </span>
                    <span className="text-base font-semibold text-ink">
                      {rp.name}
                    </span>
                    {rp.isWinner && <Badge variant="accent">Winner</Badge>}
                  </div>
                  <span className="text-lg font-bold text-ink">{rp.total}</span>
                </div>
              ))}
            </div>
            <Divider />
            <Button variant="primary" size="lg" block onClick={newGame}>
              New game
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
