import React from 'react';
import IgHead from '@/components/ig/IgHead';
import IgUnitGrid from '@/components/ig/IgUnitGrid';
import DifficultyFlow from '@/components/ig/DifficultyFlow';
import type { ReportStats, Problem } from '@/lib/reportStats';

const joinNumbers = (nums: number[], max = 12) =>
  nums.length <= max ? nums.join(' · ') : `${nums.slice(0, max).join(' · ')} 외 ${nums.length - max}`;

/**
 * 문항 지도와 난도 흐름.
 *
 * 위는 문항 하나가 칸 하나인 단위 격자 — 시험지와 번호로 바로 대조된다.
 * 옆에는 최고난도·서답형 문항 번호를 글로 한 번 더 적는다(격자를 세지 않아도
 * 되게). 아래는 문항 순서대로의 난도 흐름 선그래프.
 */
const ItemMapSection: React.FC<{ stats: ReportStats; problems: Problem[]; className?: string }> = ({ stats, problems, className = '' }) => {
  if (!problems || problems.length === 0) return null;
  return (
    <section className={`ig-module ${className}`}>
      <IgHead title="문항 지도와" title2="난도 흐름" big={stats.total} sub={['ONE TILE', 'ONE ITEM']} />

      {/* 인쇄(3칸, 내용 폭 ≈297px)에서는 격자 옆에 글이 못 들어간다 — 아래로 내린다. */}
      <div className="mt-5 flex flex-col md:flex-row print:flex-col gap-6 items-start">
        <div className="w-full md:w-[262px] print:w-full flex-none">
          <IgUnitGrid problems={problems} cols={7} />
        </div>
        <div className="min-w-0 flex-1">
          {stats.killer > 0 && (
            <>
              <span className="ig-col-l block" style={{ color: 'hsl(var(--ig-coral))' }}>Killer · 최고난도</span>
              <p className="mt-1 font-display text-[14px] font-bold leading-[1.6] text-[hsl(var(--ink))]" style={{ wordBreak: 'keep-all' }}>
                매우 어려움 {stats.killer}문항: {joinNumbers(stats.killerNumbers)}
              </p>
            </>
          )}
          {stats.subjective > 0 && stats.subjectiveNumbers.length > 0 && (
            <p className="ig-col-b" style={{ marginTop: stats.killer > 0 ? 10 : 0 }}>
              서답형 {stats.subjective}문항: {joinNumbers(stats.subjectiveNumbers)}
            </p>
          )}
        </div>
      </div>

      <div className="ig-rule-soft mt-5" />
      <DifficultyFlow className="mt-4" problems={problems} height={160} showKillerRing={stats.hasIsKiller} />
    </section>
  );
};

export default ItemMapSection;
