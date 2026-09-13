import React from 'react';
import IgHead from '@/components/ig/IgHead';
import IgHumanFigure from '@/components/ig/IgHumanFigure';
import IgIsoPie from '@/components/ig/IgIsoPie';
import { DIFFICULTIES, DIFF_LABEL, DIFF_TONE, TYPE_TONE, type DiffCount, type ReportStats } from '@/lib/reportStats';

const slicesOf = (c: DiffCount) => DIFFICULTIES.map((d) => ({ label: DIFF_LABEL[d], value: c[d], tone: DIFF_TONE[d] }));

/**
 * 객관식과 서답형 — 사람 픽토그램 둘, 그 아래 눕힌 파이 둘.
 *
 * 레퍼런스 "HUMAN ALWAYS / INFOGRAPHICS USEFUL" 의 32% / 68% 사람과 "ISOMETRIC
 * VIEWS" 의 파이다. 사람은 유형 비율만큼 차고, 파이는 그 유형 안의 난도 구성이다
 * ("서답형은 전부 어려움 이상" 이 조각 모양으로 드러난다). 문항표가 없으면
 * 사람만 그린다.
 */
const PictogramSection: React.FC<{ stats: ReportStats; className?: string }> = ({ stats, className = '' }) => {
  if (stats.total === 0) return null;
  const op = Math.round((stats.objective / stats.total) * 100);
  const sp = Math.round((stats.subjective / stats.total) * 100);
  const items = [
    { pct: op, n: stats.objective, tone: TYPE_TONE.objective, label: '객관식', en: 'OBJECTIVE' },
    { pct: sp, n: stats.subjective, tone: TYPE_TONE.subjective, label: '서답형', en: 'WRITTEN' },
  ];
  return (
    <section className={`ig-module ${className}`}>
      <IgHead title="객관식과" title2="서답형" sub={['OBJECTIVE', 'VS WRITTEN']} />
      <div className="mt-5 grid grid-cols-2 gap-2">
        {items.map((x) => (
          <div key={x.en} className="flex items-end gap-2 min-w-0">
            <IgHumanFigure pct={x.pct} tone={x.tone} height={112} />
            <div className="min-w-0 pb-1">
              <span className="ig-stat-n ig-stat-n-sm block" style={{ color: `hsl(var(${x.tone}))` }}>{x.pct}%</span>
              <span className="ig-col-l block" style={{ marginTop: 6 }}>{x.en}</span>
              <span className="block text-[11.5px] font-bold leading-snug text-[hsl(var(--ink))]" style={{ wordBreak: 'keep-all' }}>{x.label} {x.n}문항</span>
            </div>
          </div>
        ))}
      </div>
      <p className="ig-lede">사람 그림이 찬 높이가 전체 {stats.total}문항 중 비율입니다.</p>

      {!stats.fromForm && (
        <>
          <div className="ig-rule-soft mt-4" />
          <span className="ig-col-l block">Isometric views · 유형 안의 난도</span>
          <div className="mt-2 space-y-3">
            {items.filter((x) => x.n > 0).map((x) => (
              <div key={`pie-${x.en}`} className="min-w-0">
                <span className="ig-stat-c block" style={{ marginTop: 0, color: `hsl(var(${x.tone}))` }}>{x.en} · {x.label} {x.n}문항</span>
                <IgIsoPie className="mt-1" slices={slicesOf(x.en === 'OBJECTIVE' ? stats.byType.objective : stats.byType.subjective)} sub={(s, pct) => `${s.value}문항 · ${pct}%`} />
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default PictogramSection;
