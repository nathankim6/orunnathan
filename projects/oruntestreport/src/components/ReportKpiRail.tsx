import React from 'react';
import IgHead from '@/components/ig/IgHead';
import type { ReportStats } from '@/lib/reportStats';

/**
 * 시험 한눈에 보기 — 큰 숫자 네 개.
 *
 * 레퍼런스의 "81 AVG · 10 SUNNY · 7 RAINY" 어법이다. 숫자를 크게, 단위는 곁에
 * 작게, 설명은 그 아래. 칸은 가는 세로선으로만 나눈다.
 *
 * 상수(100점 만점)와 데이터에 없는 항목(isVariant 없는 리포트의 "변형 0")은
 * 싣지 않는다. 학부모 눈에 0·1·7 이 한 페이지에서 충돌하던 원인이었다.
 */
const Stat: React.FC<{ value: number | string; unit: string; cap: string; tone?: string }> = ({ value, unit, cap, tone }) => (
  <div className="px-3 first:pl-0 last:pr-0 min-w-0">
    <div className="ig-stat">
      <span className="ig-stat-n" style={tone ? { color: `hsl(var(${tone}))` } : undefined}>{value}</span>
      <span className="ig-stat-u">{unit}</span>
    </div>
    <span className="ig-stat-c block">{cap}</span>
  </div>
);

const ReportKpiRail: React.FC<{ stats: ReportStats; className?: string }> = ({ stats, className = '' }) => {
  if (stats.total === 0) return null;
  return (
    <section className={`ig-module flex flex-col ${className}`}>
      <IgHead title="시험" title2="한눈에 보기" sub={['AT A', 'GLANCE']} />
      {/* 옆 도넛 모듈이 더 높다. 숫자 줄을 남는 높이의 가운데에 둔다. */}
      <div className="mt-6 flex-1 flex items-center">
      <div className="w-full grid grid-cols-2 md:grid-cols-4 print:grid-cols-4 gap-y-6 divide-x divide-[hsl(var(--ink)/0.1)]">
        <Stat value={stats.total} unit="문항" cap="전체 출제" />
        <Stat value={stats.objective} unit="문항" cap="객관식" />
        <Stat value={stats.subjective} unit="문항" cap="서답형" tone="--ig-navy" />
        <Stat value={stats.killer} unit="문항" cap="최고난도" tone="--ig-coral" />
      </div>
      </div>
    </section>
  );
};

export default ReportKpiRail;
