import { describe, expect, it } from 'vitest';
import { shouldShowInsight, isKillerProblem } from './problemInsight';

describe('selective question commentary', () => {
  it('keeps ordinary questions compact even when an old explanation exists', () => {
    expect(shouldShowInsight({ difficulty: 'easy' })).toBe(false);
    expect(shouldShowInsight({ difficulty: 'medium', isVariant: false, isKiller: false })).toBe(false);
  });
  it('accepts each independent qualification and overlapping labels', () => {
    for (const problem of [{ isVariant: true }, { isKiller: true }, { difficulty: 'hard' }, { difficulty: 'very_hard' }, { isVariant: true, isKiller: true, difficulty: 'hard' }]) {
      expect(shouldShowInsight(problem)).toBe(true);
    }
  });
  it('counts explicit killer labels as well as very hard questions, once each', () => {
    expect([{ isKiller: true }, { difficulty: 'very_hard' }, { isKiller: true, difficulty: 'very_hard' }, { difficulty: 'hard' }].filter(isKillerProblem)).toHaveLength(3);
  });
});
