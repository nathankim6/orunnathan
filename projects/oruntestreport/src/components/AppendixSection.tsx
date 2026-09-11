import React from 'react';
import IgHead from '@/components/ig/IgHead';
import IgStackedBar from '@/components/ig/IgStackedBar';
import ProblemList from '@/components/ProblemList';
import { DIFFICULTIES, DIFF_LABEL, DIFF_TONE, type ReportStats, type Problem, type DiffCount } from '@/lib/reportStats';

const segmentsOf = (c: DiffCount) =>
  DIFFICULTIES.map((d) => ({ key: d, value: c[d], tone: DIFF_TONE[d], label: c[d] >= 2 ? String(c[d]) : undefined }));

const hardPlusPct = (c: DiffCount) => {
  const n = DIFFICULTIES.reduce((s, d) => s + c[d], 0);
  return n ? Math.round(((c.hard + c.very_hard) / n) * 100) : 0;
};

/**
 * 부록 — 출제 유형 분석.
 *
 * 맨 뒤로 보냈다. 학부모가 먼저 읽을 것은 위에 다 있고, 이건 대조용 상세다.
 * ① 유형×난도 누적 막대 세 줄(전체·객관식·서답형) — "서답형은 전부 어려움
 * 이상" 같은 사실이 그림으로 드러난다. ② 소분류 누적 막대 두 단 — 길이는
 * 문항 수, 조각은 난도. % 는 뺐다(14줄이 전부 7.1% 면 잡음이다). ③ 문항 목록.
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
      <IgHead title="출제 유형 분석" title2="문항별 상세" sub={['APPENDIX', 'DETAIL']} />

      {/* ① 유형 × 난도 */}
      <div className="mt-5">
        <span className="ig-col-l" style={{ marginTop: 0 }}>By type · 유형 × 난도</span>
        <div className="mt-3 space-y-3">
          {([['all', 'ALL', '전체'], ['objective', 'OBJECTIVE', '객관식'], ['subjective', 'SUBJECTIVE', '서답형']] as const).map(([k, en, ko]) => {
            const c = stats.byType[k];
            const n = DIFFICULTIES.reduce((s, d) => s + c[d], 0);
            if (n === 0) return null;
            return (
              <IgStackedBar
                key={k}
                labelEn={en}
                label={`${ko} ${n}`}
                readout={`어려움 이상 ${hardPlusPct(c)}%`}
                height={16}
                approxWidth={860}
                segments={segmentsOf(c)}
              />
            );
          })}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
          {DIFFICULTIES.map((d) => (
            <span key={d} className="ig-leg">
              <span className="ig-leg-dot ig-print-color" style={{ background: `hsl(var(${DIFF_TONE[d]}))`, borderRadius: 2 }} />
              <span className="ig-leg-l">{DIFF_LABEL[d]}</span>
            </span>
          ))}
        </div>
      </div>

      {/* ② 소분류 */}
      <div className="ig-rule-soft mt-6" />
      <div className="mt-5">
        <span className="ig-col-l" style={{ marginTop: 0 }}>By subtype · 소분류 {stats.bySubtype.length}종</span>
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

      {/* ③ 문항 목록 */}
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
