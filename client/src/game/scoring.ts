// Classic Yatzy scoring — formulas are authoritative, ported verbatim from
// the design handoff prototype's per-category `calc` functions.

export type CategoryId =
  | 'ones'
  | 'twos'
  | 'threes'
  | 'fours'
  | 'fives'
  | 'sixes'
  | 'onepair'
  | 'twopairs'
  | 'threekind'
  | 'fourkind'
  | 'smallstraight'
  | 'largestraight'
  | 'fullhouse'
  | 'chance'
  | 'yatzy';

export type Dice = number[]; // length 5, values 1-6

export interface Category {
  id: CategoryId;
  label: string;
  calc: (dice: Dice) => number;
}

/** counts[v] = number of dice showing face value v (index 0 unused). */
export function counts(d: Dice): number[] {
  const c = [0, 0, 0, 0, 0, 0, 0];
  d.forEach((v) => c[v]++);
  return c;
}

const sum = (d: Dice) => d.reduce((a, b) => a + b, 0);

export const categories: Category[] = [
  {
    id: 'ones',
    label: 'Ones',
    calc: (d) => d.filter((v) => v === 1).length * 1,
  },
  {
    id: 'twos',
    label: 'Twos',
    calc: (d) => d.filter((v) => v === 2).length * 2,
  },
  {
    id: 'threes',
    label: 'Threes',
    calc: (d) => d.filter((v) => v === 3).length * 3,
  },
  {
    id: 'fours',
    label: 'Fours',
    calc: (d) => d.filter((v) => v === 4).length * 4,
  },
  {
    id: 'fives',
    label: 'Fives',
    calc: (d) => d.filter((v) => v === 5).length * 5,
  },
  {
    id: 'sixes',
    label: 'Sixes',
    calc: (d) => d.filter((v) => v === 6).length * 6,
  },
  {
    id: 'onepair',
    label: 'One pair',
    calc: (d) => {
      const c = counts(d);
      for (let v = 6; v >= 1; v--) if (c[v] >= 2) return v * 2;
      return 0;
    },
  },
  {
    id: 'twopairs',
    label: 'Two pairs',
    calc: (d) => {
      const c = counts(d);
      const pairs: number[] = [];
      for (let v = 6; v >= 1; v--) if (c[v] >= 2) pairs.push(v);
      return pairs.length >= 2 ? (pairs[0] + pairs[1]) * 2 : 0;
    },
  },
  {
    id: 'threekind',
    label: 'Three of a kind',
    calc: (d) => {
      const c = counts(d);
      for (let v = 6; v >= 1; v--) if (c[v] >= 3) return v * 3;
      return 0;
    },
  },
  {
    id: 'fourkind',
    label: 'Four of a kind',
    calc: (d) => {
      const c = counts(d);
      for (let v = 6; v >= 1; v--) if (c[v] >= 4) return v * 4;
      return 0;
    },
  },
  {
    id: 'smallstraight',
    label: 'Small straight',
    calc: (d) => {
      const s = new Set(d);
      const runs = [
        [1, 2, 3, 4],
        [2, 3, 4, 5],
        [3, 4, 5, 6],
      ];
      return runs.some((run) => run.every((v) => s.has(v))) ? 15 : 0;
    },
  },
  {
    id: 'largestraight',
    label: 'Large straight',
    calc: (d) => {
      const s = new Set(d);
      return [2, 3, 4, 5, 6].every((v) => s.has(v)) ? 20 : 0;
    },
  },
  {
    id: 'fullhouse',
    label: 'Full house',
    calc: (d) => {
      const c = counts(d);
      let three = false;
      let two = false;
      for (let v = 1; v <= 6; v++) {
        if (c[v] === 3) three = true;
        if (c[v] === 2) two = true;
      }
      return three && two ? sum(d) : 0;
    },
  },
  { id: 'chance', label: 'Chance', calc: (d) => sum(d) },
  {
    id: 'yatzy',
    label: 'Yatzy',
    calc: (d) => {
      const c = counts(d);
      return c.some((n) => n === 5) ? 50 : 0;
    },
  },
];

export const upperIds: CategoryId[] = [
  'ones',
  'twos',
  'threes',
  'fours',
  'fives',
  'sixes',
];

export type Scores = Record<CategoryId, number | null>;

export function freshScores(): Scores {
  const s = {} as Scores;
  categories.forEach((c) => (s[c.id] = null));
  return s;
}

export interface Totals {
  upperSum: number;
  bonus: number;
  lowerSum: number;
  total: number;
}

export function totalsFor(scores: Scores): Totals {
  let upperSum = 0;
  upperIds.forEach((id) => (upperSum += scores[id] || 0));
  const bonus = upperSum >= 63 ? 35 : 0;
  let lowerSum = 0;
  categories.forEach((c) => {
    if (!upperIds.includes(c.id)) lowerSum += scores[c.id] || 0;
  });
  return { upperSum, bonus, lowerSum, total: upperSum + bonus + lowerSum };
}

/** Standard six-face pip layout in a 3×3 grid; returns 9 booleans (pip on/off). */
export function pipPattern(v: number): boolean[] {
  const patterns: Record<number, number[]> = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8],
  };
  const set = new Set(patterns[v] || []);
  return Array.from({ length: 9 }, (_, i) => set.has(i));
}
