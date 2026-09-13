import React from 'react';
import { ListChecks, CheckSquare, PenLine, Flame } from 'lucide-react';
import IgHead from '@/components/ig/IgHead';
import { TYPE_TONE, type ReportStats } from '@/lib/reportStats';

/**
 * 시험 한눈에 보기 — 색 타일 아이콘과 큰 숫자, 2×2.
 *
 * 레퍼런스의 "81 AVG °F · 10 SUNNY DAYS" 큰 숫자와 "USEFUL ICONS" 색 타일을
 * 한 칸에 합쳤다. 타일 색이 곧 이 리포트의 색 약속(객관식 남색, 서답형 자주,
 * 최고난도 코랄)이다. 상수(100점 만점)와 데이터에 없는 항목은 싣지 않는다.
 */
const Stat: React.FC<{ icon: React.ReactNode; value: number | string; unit: string; cap: string; capEn: string; tone: string }> = ({ icon, value, unit, cap, capEn, tone }) => (
  <div className="flex items-center gap-4 min-w-0 border-t pt-5 pb-1" style={{ borderColor: 'hsl(var(--ink) / 0.12)' }}>
    <span className="ig-print-color flex h-[56px] w-[56px] flex-none items-center justify-center text-[hsl(var(--paper))]" style={{ background: `hsl(var(${tone}))` }}>
      {icon}
    </span>
    <div className="min-w-0">
      <div className="ig-stat">
        <span className="ig-stat-n" style={{ color: `hsl(var(${tone}))` }}>{value}</span>
        <span className="ig-stat-u">{unit}</span>
      </div>
      <span className="ig-stat-c block" style={{ marginTop: 4 }}>{capEn} · {cap}</span>
    </div>
  </div>
);

const ReportKpiRail: React.FC<{ stats: ReportStats; className?: string }> = ({ stats, className = '' }) => {
  if (stats.total === 0) return null;
  return (
    <section className={`ig-module flex flex-col ${className}`}>
      <IgHead title="시험" title2="한눈에 보기" sub={['AT A', 'GLANCE']} />
      <div className="mt-2 flex-1 flex items-center">
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 print:grid-cols-1 gap-x-8 gap-y-5">
          <Stat icon={<ListChecks className="w-6 h-6" strokeWidth={1.75} />} value={stats.total} unit="문항" capEn="Total" cap="전체 출제" tone="--ink" />
          <Stat icon={<CheckSquare className="w-6 h-6" strokeWidth={1.75} />} value={stats.objective} unit="문항" capEn="Objective" cap="객관식" tone={TYPE_TONE.objective} />
          <Stat icon={<PenLine className="w-6 h-6" strokeWidth={1.75} />} value={stats.subjective} unit="문항" capEn="Written" cap="서답형" tone={TYPE_TONE.subjective} />
          {!stats.fromForm && (
            <Stat icon={<Flame className="w-6 h-6" strokeWidth={1.75} />} value={stats.killer} unit="문항" capEn="Killer" cap="최고난도" tone="--ig-coral" />
          )}
        </div>
      </div>
    </section>
  );
};

export default ReportKpiRail;
