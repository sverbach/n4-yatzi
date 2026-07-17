import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  categories,
  freshScores,
  type CategoryId,
  type Dice,
  type Scores,
} from '../game/scoring';

export type Phase = 'setup' | 'playing' | 'finished';

export interface Player {
  id: string;
  name: string;
  scores: Scores;
}

interface HistorySnapshot {
  dice: Dice;
  rollsLeft: number;
}

interface GameState {
  phase: Phase;
  players: Player[];
  newPlayerName: string;
  currentPlayerIndex: number;
  dice: Dice;
  held: boolean[];
  rollsLeft: number;
  rolling: boolean;
  darkMode: boolean;
  history: HistorySnapshot[];

  // actions
  setNewPlayerName: (name: string) => void;
  addPlayer: () => void;
  removePlayer: (id: string) => void;
  startGame: () => void;
  rollDice: () => void;
  revertRoll: () => void;
  toggleHold: (index: number) => void;
  scoreCategory: (catId: CategoryId) => void;
  newGame: () => void;
  toggleDarkMode: () => void;
}

const MAX_PLAYERS = 6;
const START_DICE: Dice = [1, 1, 1, 1, 1];
const START_HELD = [false, false, false, false, false];

const freshTurn = () => ({
  dice: [...START_DICE] as Dice,
  held: [...START_HELD],
  rollsLeft: 3,
  history: [] as HistorySnapshot[],
});

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      phase: 'setup',
      players: [],
      newPlayerName: '',
      currentPlayerIndex: 0,
      dice: [...START_DICE],
      held: [...START_HELD],
      rollsLeft: 3,
      rolling: false,
      darkMode: true,
      history: [],

      setNewPlayerName: (name) => set({ newPlayerName: name }),

      addPlayer: () => {
        const { newPlayerName, players } = get();
        const name = newPlayerName.trim();
        if (!name || players.length >= MAX_PLAYERS) return;
        const player: Player = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          name,
          scores: freshScores(),
        };
        set({ players: [...players, player], newPlayerName: '' });
      },

      removePlayer: (id) =>
        set((s) => ({ players: s.players.filter((p) => p.id !== id) })),

      startGame: () => {
        if (get().players.length < 1) return;
        set({ phase: 'playing', currentPlayerIndex: 0, ...freshTurn() });
      },

      rollDice: () => {
        const { rolling, rollsLeft, held, dice } = get();
        if (rolling || rollsLeft <= 0) return;

        const snapshot: HistorySnapshot = { dice: [...dice], rollsLeft };
        set((s) => ({ rolling: true, history: [...s.history, snapshot] }));

        let ticks = 0;
        const step = () => {
          ticks++;
          const isLast = ticks >= 6;
          set((s) => ({
            dice: s.dice.map((v, i) =>
              held[i] ? v : 1 + Math.floor(Math.random() * 6),
            ) as Dice,
            rollsLeft: isLast ? s.rollsLeft - 1 : s.rollsLeft,
            rolling: !isLast,
          }));
          if (!isLast) setTimeout(step, 60);
        };
        step();
      },

      revertRoll: () => {
        const { rolling, history } = get();
        if (rolling || history.length === 0) return;
        set((s) => {
          const next = [...s.history];
          const snapshot = next.pop()!;
          return {
            dice: [...snapshot.dice] as Dice,
            rollsLeft: snapshot.rollsLeft,
            history: next,
          };
        });
      },

      toggleHold: (index) => {
        const { rollsLeft, rolling } = get();
        if (rollsLeft === 3 || rolling) return;
        set((s) => ({ held: s.held.map((h, i) => (i === index ? !h : h)) }));
      },

      scoreCategory: (catId) => {
        const { players, currentPlayerIndex, rollsLeft, dice } = get();
        if (rollsLeft === 3) return;
        const player = players[currentPlayerIndex];
        if (!player || player.scores[catId] !== null) return;

        const cat = categories.find((c) => c.id === catId)!;
        const value = cat.calc(dice);
        const newPlayers = players.map((p, i) =>
          i === currentPlayerIndex
            ? { ...p, scores: { ...p.scores, [catId]: value } }
            : p,
        );

        const finished = newPlayers.every((p) =>
          categories.every((c) => p.scores[c.id] !== null),
        );
        if (finished) {
          set({ players: newPlayers, phase: 'finished' });
          return;
        }

        const nextIdx = (currentPlayerIndex + 1) % players.length;
        set({
          players: newPlayers,
          currentPlayerIndex: nextIdx,
          ...freshTurn(),
        });
      },

      newGame: () =>
        set((s) => ({
          phase: 'setup',
          currentPlayerIndex: 0,
          ...freshTurn(),
          players: s.players.map((p) => ({ ...p, scores: freshScores() })),
        })),

      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
    }),
    {
      name: 'yatzy-game',
      version: 1,
      // Persist the durable game/session state. Transient bits are dropped:
      // `newPlayerName` (in-flight input) and `rolling` (a timer-driven flag
      // whose setTimeout chain can't survive a reload — it defaults back to
      // false on rehydrate, leaving the settled dice values intact).
      partialize: (s) => ({
        phase: s.phase,
        players: s.players,
        currentPlayerIndex: s.currentPlayerIndex,
        dice: s.dice,
        held: s.held,
        rollsLeft: s.rollsLeft,
        darkMode: s.darkMode,
        history: s.history,
      }),
    },
  ),
);
