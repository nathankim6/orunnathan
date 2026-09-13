import React from 'react';
import IgHead from '@/components/ig/IgHead';
import IgBoxRow from '@/components/ig/IgBoxRow';
import IgStackedBar from '@/components/ig/IgStackedBar';
import { DIFFICULTIES, DIFF_LABEL, DIFF_TONE, topCategories, type ReportStats } from '@/lib/reportStats';

/**
 * 유형별 난도 구성 — 백분율 상자 줄과 누적 막대.
 *
 * 레퍼런스의 "32% 15% 24% 17% 12%" 상자 줄 + 그 아래 "72% 55% 32% 27%" 가로
 * 막대다. 상자는 대분류의 비율(전체 문항 중), 막대는 그 유형 안의 난도 구성이며
 * 막대 길이는 문항 수, 오른쪽 숫자는 어려움 이상 비율이다. 도넛과 같은 목록을
 * 쓰므로 색이 서로 맞는다.
 */
const CategoryBarsSection: React.FC<{ stats: ReportStats; className?: string }> = ({ stats, className = '' }) => {
  const cats = topCategories(stats, 5);
  const rows = topCategories(stats, 7);
  if (stats.total === 0 || stats.fromForm || cats.length === 0) return null;
  const max = Math.max(1, ...rows.map((c) => c.count));

  return (
    <section className={`ig-module ${className}`}>
      <IgHead title="유형별" title2="난도 구성" sub={['BY TYPE', 'HOW HARD']} />
      <p className="ig-lede">상자는 전체 문항 중 그 유형의 비율, 아래 막대는 유형 안의 난도 구성입니다. 막대가 길수록 문항이 많고, 오른쪽 숫자가 클수록 그 유형이 어려웠습니다.</p>
      <IgBoxRow className="mt-5" items={cats.map((c) => ({ label: c.category, pct: c.pct, tone: c.tone, value: `${c.count}문항` }))} />

      <div className="ig-rule-soft mt-5" />
      <div className="mt-4 space-y-3.5">
        {rows.map((c) => (
          <div key={c.category} className="flex items-center gap-3">
            <span className="w-[96px] flex-none truncate text-[12px] font-bold text-[hsl(var(--ink))]" title={c.category}>{c.category}</span>
            <div className="min-w-0 flex-1">
              <div style={{ width: `${Math.max(8, (c.count / max) * 100)}%` }}>
                <IgStackedBar
                  height={16}
                  approxWidth={(c.count / max) * 480}
                  segments={DIFFICULTIES.map((d) => ({ key: d, value: c.byDifficulty[d], tone: DIFF_TONE[d], label: c.byDifficulty[d] >= 2 ? String(c.byDifficulty[d]) : undefined }))}
                />
              </div>
            </div>
            <span className="ig-leg-n text-right" style={{ minWidth: 42, color: `hsl(var(${c.hardPlusPct >= 50 ? '--ig-coral' : '--ink'}))` }}>{c.hardPlusPct}%</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {DIFFICULTIES.map((d) => (
          <span key={d} className="ig-leg">
            <span className="ig-leg-dot ig-print-color" style={{ background: `hsl(var(${DIFF_TONE[d]}))`, borderRadius: 2 }} />
            <span className="ig-leg-l">{DIFF_LABEL[d]}</span>
          </span>
        ))}
        <span className="ig-stat-c" style={{ marginTop: 0, whiteSpace: 'normal', letterSpacing: '0.04em', textTransform: 'none' }}>막대 길이 = 문항 수 · 오른쪽 = 어려움 이상 비율</span>
      </div>
    </section>
  );
};

export default CategoryBarsSection;
