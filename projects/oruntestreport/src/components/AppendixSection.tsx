import React from 'react';
import IgHead from '@/components/ig/IgHead';
import ProblemList from '@/components/ProblemList';
import { DIFFICULTIES, DIFF_LABEL, DIFF_TONE, type ReportStats, type Problem } from '@/lib/reportStats';

/**
 * 부록 — 출제 유형 분석.
 *
 * 맨 뒤로 보냈다. 학부모가 먼저 읽을 것은 위에 다 있고, 이건 대조용 상세다.
 * ① 소분류 누적 막대 두 단 — 길이는 문항 수, 조각은 난도. % 는 뺐다(14줄이
 * 전부 7.1% 면 잡음이다). ② 문항 목록. 유형×난도는 사람 그림과 입체 파이가 맡는다.
 *
 * 예전의 대분류 타일(고정 목록에 걸린 두 개만 세어 "어휘 50%·서답형 50%")은
 * 없앴다.
 */
const AppendixSection: React.FC<{ stats: ReportStats; problems: Problem[]; reportId?: string; className?: string }> = ({
  stats, problems, reportId, className = '',
}) => {
  if (!problems || problems.length === 0) return null;
  const maxCount = Math.max(1, ...stats.bySubtype.map((s) => s.count));
  const subCols = stats.bySubtype.length > 20 ? 3 : 2;

  return (
    <section className={`ig-module ${className}`}>
      <IgHead title="시험 문제," title2="하나씩 살펴봅니다" sub={['APPENDIX', 'ITEM BY ITEM']} />

      {/* ① 소분류 */}
      <div className="mt-5">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <span className="ig-col-l" style={{ marginTop: 0 }}>By subtype · 소분류 {stats.bySubtype.length}종</span>
          <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {DIFFICULTIES.map((d) => (
              <span key={d} className="ig-leg">
                <span className="ig-leg-dot ig-print-color" style={{ background: `hsl(var(${DIFF_TONE[d]}))`, borderRadius: 2 }} />
                <span className="ig-leg-l">{DIFF_LABEL[d]}</span>
              </span>
            ))}
          </span>
        </div>
        <div className={`mt-3 grid gap-x-8 gap-y-2.5 grid-cols-1 ${subCols === 3 ? 'md:grid-cols-3 print:grid-cols-3' : 'md:grid-cols-2 print:grid-cols-2'}`}>
          {stats.bySubtype.map((s) => {
            const frac = s.count / maxCount;
            const approxBar = 400 * frac;
            const fits = approxBar >= s.name.length * 11 + 16;
            return (
              <div key={s.name} className="flex items-center gap-2 min-w-0">
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <div className="flex overflow-hidden ig-print-color" style={{ width: `${Math.max(6, frac * 100)}%`, height: 22, flex: 'none' }}>
                    {DIFFICULTIES.filter((d) => s.byDifficulty[d] > 0).map((d) => (
                      <div key={d} className="flex items-center overflow-hidden" style={{ width: `${(s.byDifficulty[d] / s.count) * 100}%`, background: `hsl(var(${DIFF_TONE[d]}))` }}>
                        {fits && d === s.majority && (
                          <span className="whitespace-nowrap px-2 text-[11px] font-bold text-[hsl(var(--paper))]">{s.name}</span>
                        )}
                      </div>
                    ))}
                  </div>
                  {!fits && <span className="truncate text-[11.5px] font-bold text-[hsl(var(--ink))]">{s.name}</span>}
                </div>
                <span className="ig-condensed text-[13px] font-semibold text-[hsl(var(--ink))] whitespace-nowrap">{s.count}문항</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ② 문항 목록 */}
      <div className="ig-rule-soft mt-6" />
      <div className="mt-5">
        <span className="ig-col-l" style={{ marginTop: 0 }}>Item list · 문항 목록</span>
        <div className="mt-3">
          <ProblemList problemTypes={problems as any} reportId={reportId} showKillerBadge={stats.hasIsKiller} />
        </div>
      </div>
    </section>
  );
};

export default AppendixSection;
