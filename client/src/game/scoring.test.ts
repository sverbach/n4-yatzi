import { describe, expect, it } from 'vitest';
import {
  categories,
  counts,
  freshScores,
  pipPattern,
  totalsFor,
  upperIds,
  type CategoryId,
  type Dice,
  type Scores,
} from './scoring';

const byId = new Map(categories.map((c) => [c.id, c]));

/** Score a hand in a single category, by id. */
function score(id: CategoryId, dice: Dice): number {
  const category = byId.get(id);
  if (!category) throw new Error(`no such category: ${id}`);
  return category.calc(dice);
}

function scoresWith(filled: Partial<Scores>): Scores {
  return { ...freshScores(), ...filled };
}

const ALL_IDS: CategoryId[] = [
  'ones',
  'twos',
  'threes',
  'fours',
  'fives',
  'sixes',
  'onepair',
  'twopairs',
  'threekind',
  'fourkind',
  'smallstraight',
  'largestraight',
  'fullhouse',
  'chance',
  'yatzy',
];

describe('counts', () => {
  it('tallies each face into its own index', () => {
    expect(counts([1, 2, 3, 4, 5])).toEqual([0, 1, 1, 1, 1, 1, 0]);
  });

  it('tallies repeated faces', () => {
    expect(counts([6, 6, 6, 6, 6])).toEqual([0, 0, 0, 0, 0, 0, 5]);
    expect(counts([2, 2, 5, 5, 5])).toEqual([0, 0, 2, 0, 0, 3, 0]);
  });

  it('leaves index 0 unused and always returns 7 slots', () => {
    const c = counts([1, 1, 1, 1, 1]);
    expect(c).toHaveLength(7);
    expect(c[0]).toBe(0);
  });

  it('totals to the number of dice', () => {
    const dice: Dice = [3, 1, 6, 6, 2];
    expect(counts(dice).reduce((a, b) => a + b, 0)).toBe(dice.length);
  });

  it('does not share state between calls', () => {
    const first = counts([1, 1, 1, 1, 1]);
    counts([6, 6, 6, 6, 6]);
    expect(first).toEqual([0, 5, 0, 0, 0, 0, 0]);
  });
});

describe('categories table', () => {
  it('exposes every category exactly once, in sheet order', () => {
    expect(categories.map((c) => c.id)).toEqual(ALL_IDS);
  });

  it('gives every category a non-empty label', () => {
    for (const c of categories) {
      expect(c.label.length).toBeGreaterThan(0);
    }
  });

  it('never scores negative, and never mutates the hand', () => {
    const hands: Dice[] = [
      [1, 1, 1, 1, 1],
      [1, 2, 3, 4, 5],
      [2, 3, 4, 5, 6],
      [3, 3, 3, 2, 2],
      [6, 6, 1, 1, 4],
      [4, 4, 4, 4, 2],
    ];
    for (const hand of hands) {
      const snapshot = [...hand];
      for (const c of categories) {
        expect(c.calc(hand)).toBeGreaterThanOrEqual(0);
      }
      expect(hand).toEqual(snapshot);
    }
  });
});

describe('upper section', () => {
  const upper: [CategoryId, number][] = [
    ['ones', 1],
    ['twos', 2],
    ['threes', 3],
    ['fours', 4],
    ['fives', 5],
    ['sixes', 6],
  ];

  it.each(upper)('%s scores 0 when the face is absent', (id, face) => {
    const dice: Dice = [1, 2, 3, 4, 5, 6].filter((v) => v !== face).slice(0, 5);
    expect(score(id, dice)).toBe(0);
  });

  it.each(upper)('%s counts a single die', (id, face) => {
    const dice: Dice = [
      face,
      ...[1, 2, 3, 4, 5, 6].filter((v) => v !== face),
    ].slice(0, 5);
    expect(score(id, dice)).toBe(face);
  });

  it.each(upper)('%s counts all five dice', (id, face) => {
    expect(score(id, [face, face, face, face, face])).toBe(face * 5);
  });

  it.each(upper)('%s equals face × occurrences on a mixed hand', (id, face) => {
    const dice: Dice = [face, face, 1, 2, 6];
    const occurrences = dice.filter((v) => v === face).length;
    expect(score(id, dice)).toBe(face * occurrences);
  });

  it('upperIds lists the six face categories', () => {
    expect(upperIds).toEqual([
      'ones',
      'twos',
      'threes',
      'fours',
      'fives',
      'sixes',
    ]);
  });
});

describe('one pair', () => {
  it('scores twice the paired face', () => {
    expect(score('onepair', [4, 4, 1, 2, 3])).toBe(8);
  });

  it('picks the highest pair when there are two', () => {
    expect(score('onepair', [2, 2, 5, 5, 1])).toBe(10);
  });

  it('counts a triple as a pair', () => {
    expect(score('onepair', [3, 3, 3, 1, 2])).toBe(6);
  });

  it('counts five of a kind as a pair', () => {
    expect(score('onepair', [6, 6, 6, 6, 6])).toBe(12);
  });

  it('scores 0 with no pair', () => {
    expect(score('onepair', [1, 2, 3, 4, 5])).toBe(0);
  });
});

describe('two pairs', () => {
  it('scores twice the sum of both paired faces', () => {
    expect(score('twopairs', [3, 3, 5, 5, 1])).toBe(16);
  });

  it('picks the two highest pairs', () => {
    // Only two pairs fit in five dice, so the third face is the filler.
    expect(score('twopairs', [1, 1, 6, 6, 6])).toBe(14);
  });

  it('counts a full house as two pairs', () => {
    expect(score('twopairs', [2, 2, 2, 4, 4])).toBe(12);
  });

  it('scores 0 for four of a kind — one face is not two pairs', () => {
    expect(score('twopairs', [4, 4, 4, 4, 2])).toBe(0);
  });

  it('scores 0 for a single pair', () => {
    expect(score('twopairs', [5, 5, 1, 2, 3])).toBe(0);
  });

  it('scores 0 with no pair', () => {
    expect(score('twopairs', [1, 2, 3, 4, 5])).toBe(0);
  });
});

describe('three of a kind', () => {
  it('scores three times the face', () => {
    expect(score('threekind', [5, 5, 5, 1, 2])).toBe(15);
  });

  it('counts four of a kind', () => {
    expect(score('threekind', [2, 2, 2, 2, 6])).toBe(6);
  });

  it('counts five of a kind', () => {
    expect(score('threekind', [4, 4, 4, 4, 4])).toBe(12);
  });

  it('picks the highest triple when the hand allows only one', () => {
    expect(score('threekind', [6, 6, 6, 1, 1])).toBe(18);
  });

  it('scores 0 for a pair only', () => {
    expect(score('threekind', [6, 6, 1, 2, 3])).toBe(0);
  });
});

describe('four of a kind', () => {
  it('scores four times the face', () => {
    expect(score('fourkind', [3, 3, 3, 3, 1])).toBe(12);
  });

  it('counts five of a kind', () => {
    expect(score('fourkind', [1, 1, 1, 1, 1])).toBe(4);
  });

  it('scores 0 for a triple only', () => {
    expect(score('fourkind', [6, 6, 6, 2, 2])).toBe(0);
  });

  it('scores 0 with no repeats', () => {
    expect(score('fourkind', [1, 2, 3, 4, 5])).toBe(0);
  });
});

describe('small straight', () => {
  it.each([
    [[1, 2, 3, 4, 6] as Dice, 'the 1–4 run'],
    [[2, 3, 4, 5, 1] as Dice, 'the 2–5 run'],
    [[3, 4, 5, 6, 6] as Dice, 'the 3–6 run'],
  ])('scores a flat 15 for %j (%s)', (dice) => {
    expect(score('smallstraight', dice)).toBe(15);
  });

  it('scores 15 for a five-die straight too', () => {
    expect(score('smallstraight', [1, 2, 3, 4, 5])).toBe(15);
    expect(score('smallstraight', [2, 3, 4, 5, 6])).toBe(15);
  });

  it('scores 0 when the run is broken', () => {
    expect(score('smallstraight', [1, 2, 3, 5, 6])).toBe(0);
  });

  it('scores 0 when a duplicate shortens the run', () => {
    expect(score('smallstraight', [1, 2, 3, 3, 6])).toBe(0);
  });

  it('scores 0 for five of a kind', () => {
    expect(score('smallstraight', [4, 4, 4, 4, 4])).toBe(0);
  });
});

describe('large straight', () => {
  it('scores 20 for 1-2-3-4-5', () => {
    expect(score('largestraight', [1, 2, 3, 4, 5])).toBe(20);
  });

  it('scores 20 for 2-3-4-5-6', () => {
    expect(score('largestraight', [2, 3, 4, 5, 6])).toBe(20);
  });

  it('ignores die order', () => {
    expect(score('largestraight', [5, 3, 1, 4, 2])).toBe(20);
    expect(score('largestraight', [6, 4, 2, 5, 3])).toBe(20);
  });

  it('scores 0 for a four-long run', () => {
    expect(score('largestraight', [1, 2, 3, 4, 6])).toBe(0);
    expect(score('largestraight', [2, 3, 4, 5, 5])).toBe(0);
  });

  it('scores 0 when a duplicate breaks the run', () => {
    expect(score('largestraight', [1, 1, 2, 3, 4])).toBe(0);
  });

  it('scores 0 for five of a kind', () => {
    expect(score('largestraight', [6, 6, 6, 6, 6])).toBe(0);
  });
});

describe('full house', () => {
  it('scores the sum of all five dice', () => {
    expect(score('fullhouse', [3, 3, 3, 2, 2])).toBe(13);
    expect(score('fullhouse', [6, 6, 6, 1, 1])).toBe(20);
  });

  it('accepts the pair and the triple in either order', () => {
    expect(score('fullhouse', [2, 3, 2, 3, 3])).toBe(13);
  });

  it('scores 0 for five of a kind — no distinct pair', () => {
    expect(score('fullhouse', [5, 5, 5, 5, 5])).toBe(0);
  });

  it('scores 0 for four of a kind plus a single', () => {
    expect(score('fullhouse', [5, 5, 5, 5, 2])).toBe(0);
  });

  it('scores 0 for two pairs plus a single', () => {
    expect(score('fullhouse', [2, 2, 3, 3, 4])).toBe(0);
  });

  it('scores 0 for a triple with two different singles', () => {
    expect(score('fullhouse', [4, 4, 4, 1, 2])).toBe(0);
  });
});

describe('chance', () => {
  it('sums every die', () => {
    expect(score('chance', [1, 2, 3, 4, 5])).toBe(15);
    expect(score('chance', [6, 6, 6, 6, 6])).toBe(30);
    expect(score('chance', [1, 1, 1, 1, 1])).toBe(5);
  });
});

describe('yatzy', () => {
  it.each([1, 2, 3, 4, 5, 6])('scores 50 for five %ss', (face) => {
    expect(score('yatzy', [face, face, face, face, face])).toBe(50);
  });

  it('scores 0 for four of a kind', () => {
    expect(score('yatzy', [3, 3, 3, 3, 1])).toBe(0);
  });

  it('scores 0 for a full house', () => {
    expect(score('yatzy', [3, 3, 3, 2, 2])).toBe(0);
  });
});

describe('freshScores', () => {
  it('has a null entry for every category', () => {
    const s = freshScores();
    expect(Object.keys(s).sort()).toEqual([...ALL_IDS].sort());
    expect(Object.values(s).every((v) => v === null)).toBe(true);
  });

  it('returns an independent object each call', () => {
    const a = freshScores();
    a.chance = 21;
    expect(freshScores().chance).toBeNull();
  });
});

describe('totalsFor', () => {
  it('is all zeros for an untouched sheet', () => {
    expect(totalsFor(freshScores())).toEqual({
      upperSum: 0,
      bonus: 0,
      lowerSum: 0,
      total: 0,
    });
  });

  it('sums the upper section only into upperSum', () => {
    const totals = totalsFor(
      scoresWith({ ones: 3, twos: 4, threes: 9, chance: 20 }),
    );
    expect(totals.upperSum).toBe(16);
    expect(totals.lowerSum).toBe(20);
    expect(totals.total).toBe(36);
  });

  it('sums every lower category into lowerSum', () => {
    const totals = totalsFor(
      scoresWith({
        onepair: 12,
        twopairs: 16,
        threekind: 18,
        fourkind: 20,
        smallstraight: 15,
        largestraight: 20,
        fullhouse: 24,
        chance: 25,
        yatzy: 50,
      }),
    );
    expect(totals.upperSum).toBe(0);
    expect(totals.lowerSum).toBe(200);
    expect(totals.total).toBe(200);
  });

  it('awards no bonus below 63', () => {
    // 2+6+9+12+15+18 = 62
    const totals = totalsFor(
      scoresWith({
        ones: 2,
        twos: 6,
        threes: 9,
        fours: 12,
        fives: 15,
        sixes: 18,
      }),
    );
    expect(totals.upperSum).toBe(62);
    expect(totals.bonus).toBe(0);
    expect(totals.total).toBe(62);
  });

  it('awards the bonus exactly at 63', () => {
    const totals = totalsFor(
      scoresWith({
        ones: 3,
        twos: 6,
        threes: 9,
        fours: 12,
        fives: 15,
        sixes: 18,
      }),
    );
    expect(totals.upperSum).toBe(63);
    expect(totals.bonus).toBe(35);
    expect(totals.total).toBe(98);
  });

  it('awards the bonus above 63', () => {
    const totals = totalsFor(
      scoresWith({
        ones: 5,
        twos: 10,
        threes: 15,
        fours: 20,
        fives: 25,
        sixes: 30,
      }),
    );
    expect(totals.upperSum).toBe(105);
    expect(totals.bonus).toBe(35);
    expect(totals.total).toBe(140);
  });

  it('treats scratched (0) and unplayed (null) categories alike', () => {
    const scratched = totalsFor(scoresWith({ ones: 0, chance: 0 }));
    expect(scratched).toEqual({
      upperSum: 0,
      bonus: 0,
      lowerSum: 0,
      total: 0,
    });
  });

  it('adds up a complete sheet', () => {
    const totals = totalsFor({
      ones: 3,
      twos: 6,
      threes: 9,
      fours: 12,
      fives: 15,
      sixes: 18,
      onepair: 12,
      twopairs: 22,
      threekind: 15,
      fourkind: 16,
      smallstraight: 15,
      largestraight: 20,
      fullhouse: 24,
      chance: 22,
      yatzy: 50,
    });
    expect(totals.upperSum).toBe(63);
    expect(totals.bonus).toBe(35);
    expect(totals.lowerSum).toBe(196);
    expect(totals.total).toBe(294);
  });

  it('keeps total equal to upperSum + bonus + lowerSum', () => {
    const totals = totalsFor(
      scoresWith({ fives: 20, sixes: 24, yatzy: 50, chance: 18 }),
    );
    expect(totals.total).toBe(totals.upperSum + totals.bonus + totals.lowerSum);
  });
});

describe('pipPattern', () => {
  it.each([
    [1, [4]],
    [2, [0, 8]],
    [3, [0, 4, 8]],
    [4, [0, 2, 6, 8]],
    [5, [0, 2, 4, 6, 8]],
    [6, [0, 2, 3, 5, 6, 8]],
  ])('lays out face %i at the expected grid cells', (face, lit) => {
    const expected = Array.from({ length: 9 }, (_, i) => lit.includes(i));
    expect(pipPattern(face)).toEqual(expected);
  });

  it('always returns nine cells', () => {
    for (let face = 1; face <= 6; face++) {
      expect(pipPattern(face)).toHaveLength(9);
    }
  });

  it('lights exactly as many pips as the face value', () => {
    for (let face = 1; face <= 6; face++) {
      expect(pipPattern(face).filter(Boolean)).toHaveLength(face);
    }
  });

  it('is symmetric under 180° rotation', () => {
    for (let face = 1; face <= 6; face++) {
      const pips = pipPattern(face);
      for (let i = 0; i < 9; i++) {
        expect(pips[i]).toBe(pips[8 - i]);
      }
    }
  });

  it('returns an unlit die for an out-of-range face', () => {
    const dark = Array.from({ length: 9 }, () => false);
    expect(pipPattern(0)).toEqual(dark);
    expect(pipPattern(7)).toEqual(dark);
  });
});
