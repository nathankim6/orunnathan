import React from 'react';
import IgHead from '@/components/ig/IgHead';

type Problem = {
  difficulty: 'easy' | 'medium' | 'hard' | 'very_hard';
  questionType: 'objective' | 'subjective';
  isVariant?: boolean;
  points?: number;
  isKiller?: boolean;
};

type ReportKpiRailProps = {
  problemTypes: Problem[];
};

/**
 * 한 줄 요약 지표.
 *
 * 레퍼런스의 "81 AVG · 10 SUNNY · 7 RAINY" 어법이다. 숫자를 크게 두고
 * 단위는 곁에 작게, 설명은 그 아래 더 작게 깐다. 칸을 카드로 띄우지 않고
 * 가는 세로선으로만 나눈다. 그래야 다섯 값이 한 문장처럼 읽힌다.
 */
const Stat: React.FC<{
  value: number | string;
  unit: string;
  cap: string;
  tone?: string;
}> = ({ value, unit, cap, tone }) => (
  <div className="px-3 first:pl-0 last:pr-0">
    <div className="ig-stat">
      <span className="ig-stat-n" style={tone ? { color: `hsl(var(${tone}))` } : undefined}>
        {value}
      </span>
      <span className="ig-stat-u">{unit}</span>
    </div>
    <span className="ig-stat-c block">{cap}</span>
  </div>
);

const ReportKpiRail: React.FC<ReportKpiRailProps> = ({ problemTypes }) => {
  const total = problemTypes.length;
  const killer = problemTypes.filter((p) => p.isKiller || p.difficulty === 'very_hard').length;
  const variant = problemTypes.filter((p) => p.isVariant).length;
  const hardish = problemTypes.filter((p) => p.difficulty === 'hard' || p.difficulty === 'very_hard').length;
  const hardRatio = total ? Math.round((hardish / total) * 100) : 0;

  return (
    <section className="ig-module">
      <IgHead title="시험 한눈에 보기" sub={['AT A', 'GLANCE']} />

      <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-y-7 divide-x divide-[hsl(var(--ink)/0.1)]">
        <Stat value={total} unit="문항" cap="전체 출제 문항" />
        <Stat value={100} unit="점" cap="100점 만점" />
        <Stat value={killer} unit="문항" cap="최고난도 변별" tone="--ig-coral" />
        <Stat value={variant} unit="문항" cap="지문 변형 출제" tone="--ig-slate" />
        <Stat value={hardRatio} unit="%" cap="어려움 이상 비중" tone="--ig-sand" />
      </div>
    </section>
  );
};

export default ReportKpiRail;
