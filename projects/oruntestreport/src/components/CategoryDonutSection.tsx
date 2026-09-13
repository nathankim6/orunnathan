import React from 'react';
import { BookOpen } from 'lucide-react';
import IgHead from '@/components/ig/IgHead';
import IgDonut from '@/components/ig/IgDonut';
import { coarseShares, type Problem, type ReportStats } from '@/lib/reportStats';

/**
 * 출제 유형 구성 — 굵은 도넛과 작은 파이 범례.
 *
 * 레퍼런스 첫 모듈의 도넛(가운데 아이콘, 옆에 15% TABLETS 식 범례)이다.
 * 조각은 큰 묶음(독해·어법·어휘·서술형·대화문)이고, 범례 앞 표지는 값만큼 찬
 * 작은 파이. 세부 유형은 옆 모듈의 상자 줄과 막대가 맡는다.
 */
const CategoryDonutSection: React.FC<{ stats: ReportStats; problems?: Problem[]; className?: string }> = ({ stats, problems, className = '' }) => {
  const groups = coarseShares(problems);
  if (stats.total === 0 || groups.length === 0) return null;
  return (
    <section className={`ig-module ${className}`}>
      <IgHead title="출제 유형" title2="구성" big={stats.byCategory.length} bigUnit="종" sub={['WHAT WAS', 'ASKED']} />
      <IgDonut
        className="mt-5"
        size={140}
        thickness={16}
        iso
        legend="below"
        legendMark="pie"
        countLabel={(s) => `${s.value}문항`}
        center={
          <span className="ig-print-color flex h-11 w-11 items-center justify-center rounded-full" style={{ background: 'hsl(var(--ink))', color: 'hsl(var(--paper))' }}>
            <BookOpen className="w-5 h-5" strokeWidth={1.75} />
          </span>
        }
        segments={groups.map((g) => ({ label: g.key, value: g.count, color: `hsl(var(${g.tone}))` }))}
      />
    </section>
  );
};

export default CategoryDonutSection;
