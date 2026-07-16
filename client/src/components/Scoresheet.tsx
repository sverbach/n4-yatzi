import type { CSSProperties, ReactNode } from 'react';
import { useGameStore } from '../store/gameStore';
import {
  categories,
  totalsFor,
  type CategoryId,
  type Scores,
} from '../game/scoring';
import type { Player } from '../store/gameStore';

interface Cell {
  key: string;
  text: ReactNode;
  style: CSSProperties;
  onClick?: () => void;
}

const SEATS = 6;

const baseCell = (extra: CSSProperties = {}): CSSProperties => ({
  fontFamily: 'var(--font-mono)',
  fontSize: '14px',
  padding: '6px 6px',
  border: '1px solid var(--rule-soft)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'var(--surface)',
  color: 'var(--text)',
  boxSizing: 'border-box',
  minHeight: '35px',
  ...extra,
});

export function Scoresheet() {
  const players = useGameStore((s) => s.players);
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex);
  const dice = useGameStore((s) => s.dice);
  const rollsLeft = useGameStore((s) => s.rollsLeft);
  const phase = useGameStore((s) => s.phase);
  const scoreCategory = useGameStore((s) => s.scoreCategory);

  const slots: Array<{ player: Player; index: number } | null> = Array.from(
    { length: SEATS },
    (_, i) => (i < players.length ? { player: players[i], index: i } : null),
  );

  const cells: Cell[] = [];
  let k = 0;
  const push = (c: Omit<Cell, 'key'>) => cells.push({ ...c, key: `${k++}` });

  // Header row
  push({
    text: 'Name',
    style: baseCell({
      justifyContent: 'flex-start',
      paddingLeft: '14px',
      background: 'var(--ink)',
      color: 'var(--bg)',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      fontSize: '12px',
      // Sticky top-left corner: pinned both vertically and horizontally, so it
      // stays put while the sheet scrolls in either axis.
      position: 'sticky',
      top: 0,
      left: 0,
      zIndex: 3,
      border: '1px solid var(--ink)',
    }),
  });
  slots.forEach((slot) => {
    if (!slot) {
      push({
        text: '—',
        style: baseCell({
          background: 'var(--ink)',
          color: 'var(--text-soft)',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          fontSize: '10px',
          position: 'sticky',
          top: 0,
          zIndex: 2,
          border: '1px solid var(--ink)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }),
      });
      return;
    }
    const isCurrent = slot.index === currentPlayerIndex;
    push({
      text: (
        <span
          title={slot.player.name}
          style={{
            display: 'block',
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {slot.player.name}
        </span>
      ),
      style: baseCell({
        background: isCurrent ? 'var(--accent)' : 'var(--ink)',
        color: isCurrent ? 'var(--accent-ink)' : 'var(--bg)',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        fontSize: '12px',
        overflow: 'hidden',
        position: 'sticky',
        top: 0,
        zIndex: 2,
        border: '1px solid var(--ink)',
      }),
    });
  });

  const labelCell = (text: string, bold: boolean) =>
    push({
      text,
      style: baseCell({
        justifyContent: 'flex-start',
        paddingLeft: '14px',
        background: 'var(--surface)',
        fontWeight: bold ? 900 : 400,
        fontSize: '12px',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: 'var(--ink)',
        position: 'sticky',
        borderRightColor: 'var(--ink)',
        borderRightWidth: '2px',
        borderTopColor: bold ? 'var(--ink)' : 'var(--rule-soft)',
        borderTopWidth: bold ? '2px' : '1px',
        top: 0,
        left: 0,
        zIndex: 1,
      }),
    });

  const plainValueCell = (
    scores: Scores,
    pick: 'upperSum' | 'bonus' | 'total',
    bold: boolean,
  ) =>
    push({
      text: totalsFor(scores)[pick],
      style: baseCell({
        background: 'var(--surface)',
        fontWeight: bold ? 900 : 600,
        color: 'var(--ink)',
        fontSize: '14px',
        borderTopColor: bold ? 'var(--ink)' : 'var(--rule-soft)',
        borderTopWidth: bold ? '2px' : '1px',
      }),
    });

  const emptyCell = (bold = false) =>
    push({
      text: '',
      style: baseCell({
        background: 'var(--surface)',
        color: 'var(--muted)',
        borderTopColor: bold ? 'var(--ink)' : 'var(--rule-soft)',
        borderTopWidth: bold ? '2px' : '1px',
      }),
    });

  categories.forEach((cat) => {
    labelCell(cat.label, false);
    slots.forEach((slot) => {
      if (!slot) {
        emptyCell();
        return;
      }
      const { player, index } = slot;
      const scored = player.scores[cat.id];
      const isCurrentCol = phase === 'playing' && index === currentPlayerIndex;
      const canScoreHere = isCurrentCol && rollsLeft < 3 && scored === null;

      if (scored !== null) {
        push({
          text: scored === 0 ? '/' : scored,
          style: baseCell({ fontWeight: 600, color: 'var(--ink)' }),
        });
      } else if (canScoreHere) {
        const catId: CategoryId = cat.id;
        push({
          text: cat.calc(dice),
          onClick: () => scoreCategory(catId),
          style: baseCell({
            background: 'var(--surface)',
            color: 'var(--accent-edge)',
            fontWeight: 700,
            cursor: 'pointer',
          }),
        });
      } else {
        push({
          text: '',
          style: baseCell({ color: 'var(--muted)' }),
        });
      }
    });

    // Inject Sum + Bonus rows right after Sixes.
    if (cat.id === 'sixes') {
      labelCell('Sum', true);
      slots.forEach((slot) =>
        slot
          ? plainValueCell(slot.player.scores, 'upperSum', true)
          : emptyCell(true),
      );
      labelCell('Bonus (≥63)', false);
      slots.forEach((slot) =>
        slot
          ? plainValueCell(slot.player.scores, 'bonus', false)
          : emptyCell(false),
      );
    }
  });

  // Final Total row
  labelCell('Total', true);
  slots.forEach((slot) =>
    slot ? plainValueCell(slot.player.scores, 'total', true) : emptyCell(true),
  );

  return (
    <div
      className="self-center w-fit max-w-full rounded-[var(--r-lg)] p-3.5"
      style={{ background: 'var(--mat)' }}
    >
      <div
        className="w-fit max-w-full max-h-[60vh] overflow-auto rounded-[var(--r-md)] border-2 border-ink bg-surface"
        style={{
          boxShadow:
            '0 12px 32px -6px rgba(88,110,117,0.35), 0 24px 56px -12px rgba(88,110,117,0.3)',
        }}
      >
        <div
          className="grid"
          style={{
            gridTemplateColumns: '150px repeat(6, minmax(44px, 56px))',
            minWidth: 'max-content',
          }}
        >
          {cells.map((cell) => (
            <div key={cell.key} style={cell.style} onClick={cell.onClick}>
              {cell.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
