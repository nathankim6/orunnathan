/**
 * 리포트 숫자의 단일 출처.
 *
 * 같은 숫자를 여러 모듈이 따로 계산하면 언젠가 서로 어긋난다(실제로 한눈에
 * 보기의 "변형 0" 과 출제 특징의 "변형 7", 원문 대조의 "1건" 이 한 페이지에
 * 같이 찍혔다). 모든 모듈은 여기서 계산한 값만 보여 준다.
 */
export type Difficulty = 'easy' | 'medium' | 'hard' | 'very_hard';
export const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard', 'very_hard'];
export const DIFF_LABEL: Record<Difficulty, string> = { easy: '쉬움', medium: '보통', hard: '어려움', very_hard: '매우 어려움' };
export const DIFF_LABEL_EN: Record<Difficulty, string> = { easy: 'EASY', medium: 'MEDIUM', hard: 'HARD', very_hard: 'KILLER' };
export const DIFF_TONE: Record<Difficulty, string> = { easy: '--ig-teal', medium: '--ig-slate', hard: '--ig-sand', very_hard: '--ig-coral' };
const WEIGHT: Record<Difficulty, number> = { easy: 1, medium: 2, hard: 3, very_hard: 4 };

export interface Problem {
  id?: string;
  name: string;
  category: string;
  questionType: 'objective' | 'subjective';
  difficulty: Difficulty;
  isVariant?: boolean;
  points?: number;
  isKiller?: boolean;
}

export type DiffCount = Record<Difficulty, number>;

export interface ReportStats {
  total: number;
  objective: number;
  subjective: number;
  /** isKiller 이거나 매우 어려움 */
  killer: number;
  /** 1부터 세는 문항 번호 */
  killerNumbers: number[];
  subjectiveNumbers: number[];
  /** problemTypes 중 isKiller 가 정의된 것이 하나라도 있는가 */
  hasIsKiller: boolean;
  hasIsVariant: boolean;
  variant: number;
  byDifficulty: Record<Difficulty, { count: number; pct: number }>;
  /** 어려움 + 매우 어려움 비율 */
  hardPlusPct: number;
  hardPlus: number;
  byType: Record<'all' | 'objective' | 'subjective', DiffCount>;
  byCategory: { category: string; count: number; weight: number; byDifficulty: DiffCount; majority: Difficulty }[];
  bySubtype: { name: string; count: number; weight: number; byDifficulty: DiffCount; majority: Difficulty }[];
  /** 문항표가 비어 있어 양식 입력값으로 합계를 낸 경우 */
  fromForm: boolean;
}

const zero = (): DiffCount => ({ easy: 0, medium: 0, hard: 0, very_hard: 0 });

/** 가장 많은 난도. 동률이면 어려운 쪽. */
const majorityOf = (c: DiffCount): Difficulty => {
  let best: Difficulty = 'medium';
  let bestN = -1;
  for (const d of DIFFICULTIES) {
    if (c[d] > bestN || (c[d] === bestN && WEIGHT[d] > WEIGHT[best])) { best = d; bestN = c[d]; }
  }
  return best;
};

const pct = (n: number, total: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

/**
 * @param problems 문항표
 * @param form 단순 분석 모드처럼 문항표가 없을 때 쓰는 양식 합계
 */
export function computeReportStats(
  problems: Problem[] | undefined,
  form?: { total?: number; objective?: number; subjective?: number },
): ReportStats {
  const list = (problems || []).filter(Boolean);
  const fromForm = list.length === 0 && !!form && (form.total || 0) > 0;

  const total = fromForm ? (form!.total || 0) : list.length;
  const objective = fromForm ? (form!.objective || 0) : list.filter((p) => p.questionType === 'objective').length;
  const subjective = fromForm ? (form!.subjective || 0) : list.filter((p) => p.questionType === 'subjective').length;

  const isKillerOf = (p: Problem) => !!p.isKiller || p.difficulty === 'very_hard';
  const killerNumbers = list.map((p, i) => (isKillerOf(p) ? i + 1 : 0)).filter(Boolean);
  const subjectiveNumbers = list.map((p, i) => (p.questionType === 'subjective' ? i + 1 : 0)).filter(Boolean);
  const hasIsKiller = list.some((p) => typeof p.isKiller === 'boolean');
  const hasIsVariant = list.some((p) => typeof p.isVariant === 'boolean');
  const variant = list.filter((p) => !!p.isVariant).length;

  const byType = { all: zero(), objective: zero(), subjective: zero() };
  for (const p of list) {
    const d = DIFFICULTIES.includes(p.difficulty) ? p.difficulty : 'medium';
    byType.all[d] += 1;
    byType[p.questionType === 'subjective' ? 'subjective' : 'objective'][d] += 1;
  }

  const byDifficulty = {
    easy: { count: byType.all.easy, pct: pct(byType.all.easy, list.length) },
    medium: { count: byType.all.medium, pct: pct(byType.all.medium, list.length) },
    hard: { count: byType.all.hard, pct: pct(byType.all.hard, list.length) },
    very_hard: { count: byType.all.very_hard, pct: pct(byType.all.very_hard, list.length) },
  };
  const hardPlus = byType.all.hard + byType.all.very_hard;

  const group = (key: (p: Problem) => string) => {
    const map = new Map<string, DiffCount>();
    for (const p of list) {
      const k = key(p);
      if (!map.has(k)) map.set(k, zero());
      const d = DIFFICULTIES.includes(p.difficulty) ? p.difficulty : 'medium';
      map.get(k)![d] += 1;
    }
    return Array.from(map.entries()).map(([name, c]) => {
      const count = DIFFICULTIES.reduce((s, d) => s + c[d], 0);
      const weight = DIFFICULTIES.reduce((s, d) => s + c[d] * WEIGHT[d], 0);
      return { name, count, weight, byDifficulty: c, majority: majorityOf(c) };
    }).sort((a, b) => b.count - a.count || b.weight - a.weight || a.name.localeCompare(b.name, 'ko'));
  };

  const byCategory = group((p) => (p.category || p.name?.split(' ')[0] || '기타').trim())
    .map((g) => ({ category: g.name, count: g.count, weight: g.weight, byDifficulty: g.byDifficulty, majority: g.majority }));
  const bySubtype = group((p) => (p.name || p.category || '기타').trim());

  return {
    total, objective, subjective,
    killer: killerNumbers.length, killerNumbers, subjectiveNumbers,
    hasIsKiller, hasIsVariant, variant,
    byDifficulty, hardPlusPct: pct(hardPlus, list.length), hardPlus,
    byType, byCategory, bySubtype, fromForm,
  };
}

/* ── 강사 코멘트 ────────────────────────────────────────────────── */

export interface TierEntry {
  label: string;
  labelEn: string;
  body: string;
  tone: string;
}

const TIER_META: Record<string, { en: string; tone: string }> = {
  최상위권: { en: 'TOP', tone: '--ig-coral' },
  상위권: { en: 'TOP', tone: '--ig-coral' },
  중상위권: { en: 'UPPER MID', tone: '--ig-sand' },
  중위권: { en: 'MID', tone: '--ig-sand' },
  중하위권: { en: 'LOWER MID', tone: '--ig-slate' },
  하위권: { en: 'BASE', tone: '--ig-teal' },
  기초: { en: 'BASE', tone: '--ig-teal' },
};

/**
 * "상위권 — …\n\n중위권 — …\n\n하위권 — …" 꼴을 타임라인 항목으로 나눈다.
 * 두 단 이상 못 찾으면 null — 부르는 쪽은 문단을 그대로 보여 준다.
 * 강사 글을 자르거나 고치지 않는다. 구분자만 뗀다.
 */
export function parseTiers(text?: string): TierEntry[] | null {
  if (!text) return null;
  const re = /^\s*(최상위권|상위권|중상위권|중위권|중하위권|하위권|기초)\s*[—–\-:：]\s*/;
  const chunks = text.split(/\n\s*\n/).map((c) => c.trim()).filter(Boolean);
  const out: TierEntry[] = [];
  for (const c of chunks) {
    const m = c.match(re);
    if (!m) continue;
    const meta = TIER_META[m[1]] || { en: '', tone: '--ig-slate' };
    out.push({ label: m[1], labelEn: meta.en, body: c.slice(m[0].length).trim(), tone: meta.tone });
  }
  return out.length >= 2 ? out : null;
}

/** overallEvaluation 은 JSON 문자열이다. 실패하면 전체를 종합의견으로 본다. */
export function parseOverallEvaluation(raw?: string): { strategy?: string; overall?: string } {
  if (!raw || !raw.trim()) return {};
  try {
    const arr = JSON.parse(raw) as { category?: string; evaluation?: string }[];
    if (!Array.isArray(arr)) return { overall: raw };
    const out: { strategy?: string; overall?: string } = {};
    for (const it of arr) {
      const cat = it.category === '종합 평가' ? '종합의견' : it.category;
      const text = (it.evaluation || '').trim();
      if (!text) continue;
      if (cat === '수준별 학습 전략') out.strategy = text;
      else if (cat === '종합의견') out.overall = text;
    }
    return out;
  } catch {
    return { overall: raw };
  }
}
