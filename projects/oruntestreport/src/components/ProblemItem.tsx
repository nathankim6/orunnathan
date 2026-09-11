import React from 'react';
import { DIFF_LABEL, DIFF_TONE, type Difficulty } from '@/lib/reportStats';

interface ProblemItemProps {
  problem: {
    id: string;
    name: string;
    category: string;
    questionType: 'objective' | 'subjective';
    difficulty: Difficulty;
    isVariant?: boolean;
    points?: number;
    isKiller?: boolean;
    answer?: string;
    insight?: string;
  };
  index: number;
  /** isKiller 필드가 실제로 있는 리포트에서만 KILLER 뱃지를 단다 */
  showKillerBadge?: boolean;
}

const LEVEL: Record<Difficulty, number> = { easy: 1, medium: 2, hard: 3, very_hard: 4 };

/**
 * 문항 한 줄 — 번호 타일 · 유형 · 세부유형 · 난도.
 *
 * 번호 타일은 문항 지도와 같은 시각 언어다(난도 색 사각 안 번호). 분류 열은
 * 세부유형과 겹쳐 뺐다. 색은 토큰만 쓴다.
 */
const ProblemItem: React.FC<ProblemItemProps> = ({ problem, index, showKillerBadge = false }) => {
  const d: Difficulty = (['easy', 'medium', 'hard', 'very_hard'] as Difficulty[]).includes(problem.difficulty) ? problem.difficulty : 'medium';
  const isSubjective = problem.questionType === 'subjective';
  const veryHard = d === 'very_hard';
  const isHard = d === 'hard';
  const killerBadge = showKillerBadge && !!problem.isKiller;
  const level = LEVEL[d];
  const nameColor = veryHard ? 'hsl(var(--ig-coral))' : isHard ? 'hsl(var(--ig-sand))' : 'hsl(var(--ink))';

  return (
    <div className="grid items-center gap-x-2.5 py-[5px]" style={{ gridTemplateColumns: '24px 30px minmax(0, 1fr) auto', minHeight: 32 }}>
      <span
        className="ig-condensed ig-print-color flex h-[22px] w-[22px] items-center justify-center text-[11px] font-semibold text-[hsl(var(--paper))]"
        style={{ background: `hsl(var(${DIFF_TONE[d]}))` }}
        aria-label={`문항 번호 ${index + 1}`}
      >
        {index + 1}
      </span>

      <span
        className="ig-chip ig-chip-ghost justify-center"
        style={{ padding: '2px 0', width: 26, fontSize: 10, letterSpacing: 0 }}
        title={isSubjective ? '서답형' : '객관식'}
      >
        {isSubjective ? '서' : '객'}
      </span>

      <span className="flex min-w-0 items-center gap-1.5">
        <span className="truncate text-[12.5px] font-semibold" style={{ color: nameColor }}>{problem.name}</span>
        {killerBadge && <span className="ig-chip ig-print-color" style={{ background: 'hsl(var(--ig-coral))', fontSize: 9 }}>Killer</span>}
        {typeof problem.points === 'number' && problem.points > 0 && (
          <span className="ig-condensed whitespace-nowrap text-[10.5px] font-medium text-[hsl(var(--ink-soft))]">{problem.points}점</span>
        )}
      </span>

      <span className="flex items-center justify-end gap-1.5">
        <span className="inline-flex items-end gap-[2px]">
          {[1, 2, 3, 4].map((i) => (
            <span key={i} className="inline-block w-[3px] ig-print-color"
                  style={{ height: `${3 + i * 1.6}px`, background: i <= level ? `hsl(var(${DIFF_TONE[d]}))` : 'hsl(var(--ink) / 0.12)' }} />
          ))}
        </span>
        <span className="whitespace-nowrap text-[10.5px] font-semibold" style={{ color: veryHard || isHard ? nameColor : 'hsl(var(--ink-soft))' }}>
          {DIFF_LABEL[d]}
        </span>
      </span>

      {(problem.answer?.trim() || problem.insight?.trim()) && (
        <div className="col-span-4 flex flex-wrap items-start gap-x-2 gap-y-1 pb-1" style={{ paddingLeft: 26 }}>
          {problem.answer?.trim() && (
            <span className="ig-chip ig-chip-ghost" style={{ textTransform: 'none', letterSpacing: 0, fontSize: 10 }}>정답 {problem.answer.trim()}</span>
          )}
          {problem.insight?.trim() && (
            <p className="min-w-0 flex-1 text-[11.5px] leading-[1.55] text-[hsl(var(--ink-soft))]" style={{ wordBreak: 'keep-all' }}>
              {problem.insight.trim()}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProblemItem;
