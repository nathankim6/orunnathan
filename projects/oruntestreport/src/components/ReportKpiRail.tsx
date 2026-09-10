import React from 'react';
import FxStage from '@/components/FxStage';
import { ListChecks, Sigma, Flame, Shuffle, Gauge } from 'lucide-react';

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
 * 예전에는 다섯 칸이 한 덩어리로 붙어 있고 칸마다 배경색이 달라 시험지보다
 * 알림판처럼 보였다. 흰 카드 다섯 장을 같은 간격으로 떼어 놓고, 색은 작은
 * 아이콘 타일에만 남긴다. 숫자를 크게 키우고 설명을 작게 낮추면 눈이 숫자에
 * 먼저 가고 카드끼리 비교가 된다.
 */
const KpiCard: React.FC<{
  label: string;
  value: string | number;
  unit?: string;
  hint?: string;
  tone?: string;
  icon: React.ReactNode;
}> = ({ label, value, unit, hint, tone = '--c1', icon }) => (
  <div className="rp-card rp-card-tight" style={{ ['--tone' as never]: `var(${tone})` }}>
    <div className="rp-head">
      <span className="rp-glyph">{icon}</span>
      <span className="rp-label">{label}</span>
    </div>
    <div className="rp-metric mt-4">
      <span className="rp-metric-num">{value}</span>
      {unit && <span className="rp-metric-unit">{unit}</span>}
    </div>
    {hint && <span className="rp-metric-cap">{hint}</span>}
  </div>
);

const ReportKpiRail: React.FC<ReportKpiRailProps> = ({ problemTypes }) => {
  const total = problemTypes.length;
  const killer = problemTypes.filter((p) => p.isKiller || p.difficulty === 'very_hard').length;
  const variant = problemTypes.filter((p) => p.isVariant).length;
  const hardish = problemTypes.filter((p) => p.difficulty === 'hard' || p.difficulty === 'very_hard').length;
  const hardRatio = total ? Math.round((hardish / total) * 100) : 0;

  return (
    <>
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
      <KpiCard
        label="문항"
        value={total}
        unit="문항"
        hint="전체 출제 문항"
        tone="--c1"
        icon={<ListChecks className="w-3.5 h-3.5" />}
      />
      <KpiCard
        label="배점"
        value={100}
        unit="점"
        hint="100점 만점"
        tone="--c3"
        icon={<Sigma className="w-3.5 h-3.5" />}
      />
      <KpiCard
        label="킬러"
        value={killer}
        unit="문항"
        hint="최고난도 변별 문항"
        tone="--diff-xhard"
        icon={<Flame className="w-3.5 h-3.5" />}
      />
      <KpiCard
        label="변형"
        value={variant}
        unit="문항"
        hint="지문 변형 출제"
        tone="--c5"
        icon={<Shuffle className="w-3.5 h-3.5" />}
      />
      <KpiCard
        label="상위 난도"
        value={hardRatio}
        unit="%"
        hint="어려움 이상 비중"
        tone="--c4"
        icon={<Gauge className="w-3.5 h-3.5" />}
      />
    </div>

    {/* 문항 하나가 점 하나 — 화면에서만 돈다 */}
    <FxStage
      kind="orbit"
      options={{
        count: total,
        tone: 'hsl(214, 30%, 62%)',
        tone2: 'hsl(188, 30%, 60%)',
      }}
      height={112}
      label="문항 구성"
      readout={`${total}문항 · 킬러 ${killer}`}
      className="mt-3 md:mt-4"
    />
    </>
  );
};

export default ReportKpiRail;
