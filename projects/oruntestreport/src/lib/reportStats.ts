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
/** 문항 유형 색 — 객관식 남색, 서답형 자주. 난도 색(청록·슬레이트·모래·코랄)과 겹치지 않는다. */
export const TYPE_TONE = { objective: '--ig-navy', subjective: '--ig-plum' } as const;
/** 출제 유형(대분류) 색 순환 — 많은 순서대로 배정한다 */
export const CATEGORY_TONES = ['--ig-coral', '--ig-teal', '--ig-sand', '--ig-navy', '--ig-plum', '--ig-slate'];
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

/* ── 대분류를 다시 큰 묶음으로 ─────────────────────────────────
   AI 자동 채움은 category 에 세부 유형(빈칸추론·순서배열…)을 넣는다. 도넛에
   열네 조각을 올릴 수는 없으니 낱말로 큰 묶음을 만든다. 순서가 곧 우선순위다
   ("서술형 요약 쓰기" 는 독해가 아니라 서술형). 못 고르면 "기타". */
export const COARSE_GROUPS: { key: string; test: RegExp; tone: string }[] = [
  { key: '서술형', test: /서술|서답|영작|쓰기|writing/i, tone: '--ig-plum' },
  { key: '어법', test: /어법|문법|grammar/i, tone: '--ig-coral' },
  { key: '어휘', test: /어휘|단어|영영|vocab|word/i, tone: '--ig-sand' },
  { key: '대화문', test: /대화|듣기|listening|dialog/i, tone: '--ig-navy' },
  { key: '독해', test: /독해|본문|지문|빈칸|순서|삽입|요약|제목|주제|함축|일치|추론|지칭|무관|심경|요지|목적|분위기|글의|read|passage/i, tone: '--ig-teal' },
];
export const coarseGroupOf = (p: { category?: string; name?: string }) => {
  const text = `${p.category || ''} ${p.name || ''}`;
  return COARSE_GROUPS.find((g) => g.test.test(text)) || { key: '기타', tone: '--ig-slate', test: /$^/ };
};

export interface CoarseShare { key: string; count: number; pct: number; tone: string; byDifficulty: DiffCount }

/** 큰 묶음별 문항 수 — 많은 순. 도넛과 기기 목업이 쓴다. */
export function coarseShares(problems: Problem[] | undefined): CoarseShare[] {
  const list = (problems || []).filter(Boolean);
  if (list.length === 0) return [];
  const map = new Map<string, { tone: string; c: DiffCount }>();
  for (const p of list) {
    const g = coarseGroupOf(p);
    if (!map.has(g.key)) map.set(g.key, { tone: g.tone, c: zero() });
    const d = DIFFICULTIES.includes(p.difficulty) ? p.difficulty : 'medium';
    map.get(g.key)!.c[d] += 1;
  }
  return Array.from(map.entries())
    .map(([key, v]) => {
      const count = DIFFICULTIES.reduce((s, d) => s + v.c[d], 0);
      return { key, count, pct: pct(count, list.length), tone: v.tone, byDifficulty: v.c };
    })
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key, 'ko'));
}

export interface CategoryShare {
  category: string;
  count: number;
  pct: number;
  tone: string;
  byDifficulty: DiffCount;
  /** 어려움 이상 비율 (이 유형 안에서) */
  hardPlusPct: number;
}

/**
 * 상위 n 개 대분류와 나머지("기타") — 도넛·상자 줄·누적 막대가 같은 목록을 쓴다.
 * 나머지가 한 종류뿐이면 이름을 그대로 둔다(“기타 1문항” 은 정보가 없다).
 */
export function topCategories(stats: ReportStats, n = 5): CategoryShare[] {
  const total = stats.byCategory.reduce((s, c) => s + c.count, 0);
  if (total === 0) return [];
  const head = stats.byCategory.slice(0, n);
  const tail = stats.byCategory.slice(n);
  const rows = head.map((c) => ({ category: c.category, count: c.count, byDifficulty: c.byDifficulty }));
  if (tail.length === 1) rows.push({ category: tail[0].category, count: tail[0].count, byDifficulty: tail[0].byDifficulty });
  else if (tail.length > 1) {
    const c = zero();
    for (const t of tail) for (const d of DIFFICULTIES) c[d] += t.byDifficulty[d];
    rows.push({ category: `기타 ${tail.length}종`, count: tail.reduce((s, t) => s + t.count, 0), byDifficulty: c });
  }
  return rows.map((r, i) => ({
    ...r,
    pct: pct(r.count, total),
    tone: CATEGORY_TONES[i % CATEGORY_TONES.length],
    hardPlusPct: pct(r.byDifficulty.hard + r.byDifficulty.very_hard, r.count),
  }));
}
