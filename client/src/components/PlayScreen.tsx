import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { BottomSheet } from './ui/BottomSheet';
import { Scoresheet } from './Scoresheet';
import { DiceArea } from './DiceArea';

function MoonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="currentColor"
      aria-hidden
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function PlayScreen() {
  const darkMode = useGameStore((s) => s.darkMode);
  const toggleDarkMode = useGameStore((s) => s.toggleDarkMode);
  const newGame = useGameStore((s) => s.newGame);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const themeLabel = darkMode ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-6">
      <div className="flex w-fit max-w-full flex-col self-center">
        <div className="flex justify-end">
          <div className="relative inline-flex items-center pe-3.5">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              title="Menu"
              className="absolute top-1/2 right-full mr-2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center text-ink transition-colors duration-[var(--dur-2)] [transition-timing-function:var(--ease)] hover:text-accent"
            >
              <MenuIcon />
            </button>

            <button
              type="button"
              onClick={toggleDarkMode}
              aria-label={themeLabel}
              title={themeLabel}
              className="group relative inline-flex cursor-pointer items-center border-0 bg-transparent p-0"
            >
              <span className="t-display" style={{ fontSize: 'var(--t-2xl)' }}>
                Yatzy
              </span>
              <span className="absolute top-1/2 left-full flex h-6 w-6 -translate-y-1 items-center justify-center text-ink transition-colors duration-[var(--dur-2)] [transition-timing-function:var(--ease)] group-hover:text-accent">
                {darkMode ? <MoonIcon /> : <></>}
              </span>
            </button>
          </div>
        </div>

        <Scoresheet />

        <DiceArea />
      </div>

      <BottomSheet
        open={menuOpen}
        title="Menu"
        onClose={() => setMenuOpen(false)}
      >
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              setConfirmOpen(true);
            }}
            className="flex w-full cursor-pointer items-center gap-3 rounded-[var(--r-md)] border-2 border-ink bg-surface px-4 py-3 text-left font-mono text-sm font-bold tracking-[0.06em] text-ink uppercase transition-all duration-[var(--dur-2)] [transition-timing-function:var(--ease)] hover:bg-ink hover:text-bg active:translate-y-px"
          >
            End game
          </button>
        </div>
      </BottomSheet>

      <ConfirmDialog
        open={confirmOpen}
        eyebrow="END GAME"
        title="Start a new game?"
        message="This ends the current game and clears every score. Player names are kept."
        confirmLabel="New game"
        cancelLabel="Cancel"
        onConfirm={() => {
          setConfirmOpen(false);
          newGame();
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
