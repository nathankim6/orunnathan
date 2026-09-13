export type InsightProblem = { isVariant?: boolean; isKiller?: boolean; difficulty?: string };

// Labels, summaries and explanation visibility must share the same rule.
export const isKillerProblem = (p: InsightProblem) => Boolean(p.isKiller) || p.difficulty === 'very_hard';
export const isHardProblem = (p: InsightProblem) => p.difficulty === 'hard';
export const shouldShowInsight = (p: InsightProblem) => Boolean(p.isVariant) || isKillerProblem(p) || isHardProblem(p);
