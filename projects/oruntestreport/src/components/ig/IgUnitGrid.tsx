import React from 'react';
import { DIFF_TONE, DIFF_LABEL, type Difficulty } from '@/lib/reportStats';

type Problem = {
  id?: string;
  difficulty: Difficulty;
  questionType?: 'objective' | 'subjective';
  isKiller?: boolean;
};

/**
 * 단위 차트 — 문항 하나가 칸 하나.
 *
 * 레퍼런스의 픽토그램 어법(사람 하나가 단위 하나)이다. 사각 칸 하나가 문항
 * 하나이고 색이 난도, 칸 안에 문항 번호가 있어 시험지와 바로 대조된다.
 * 서답형은 우하단 흰 귀, 최고난도는 진한 테두리 — 색이 빠진 흑백 복사에서도
 * 구분된다. 귀·테두리는 실제 요소와 border 로 그린다(가상 요소·그림자는
 * 인쇄에서 빠진다).
 *
 * 칸은 폭에 따라 줄어든다(px 고정 금지 — 좁은 칸에서 넘친다).
 */
const IgUnitGrid: React.FC<{
  problems?: Problem[];
  cols?: number;
  showLegend?: boolean;
  className?: string;
}> = ({ problems, cols, showLegend = true, className = '' }) => {
  const list = problems || [];
  const n = list.length;
  if (n === 0) return null;
  const many = n > 60;
  const c = cols ?? (many ? 12 : n <= 35 ? 7 : 10);
  const maxW = c * 34 + (c - 1) * 4;

  return (
    <div className={className}>
      <div
        className="grid ig-print-color"
        style={{ gridTemplateColumns: `repeat(${c}, minmax(0, 1fr))`, gap: 4, maxWidth: maxW }}
        role="img"
        aria-label={`문항 ${n}개의 난도 지도`}
      >
        {list.map((p, i) => {
          const d: Difficulty = (['easy', 'medium', 'hard', 'very_hard'] as Difficulty[]).includes(p.difficulty) ? p.difficulty : 'medium';
          const killer = !!p.isKiller || d === 'very_hard';
          const subjective = p.questionType === 'subjective';
          return (
            <div
              key={p.id ?? i}
              title={`${i + 1}번 · ${DIFF_LABEL[d]}${subjective ? ' · 서답형' : ''}${killer ? ' · 최고난도' : ''}`}
              className="relative flex items-center justify-center ig-print-color"
              style={{
                aspectRatio: '1 / 1',
                boxSizing: 'border-box',
                background: `hsl(var(${DIFF_TONE[d]}))`,
                border: killer ? '2px solid hsl(var(--ink) / 0.55)' : undefined,
              }}
            >
              {!many && (
                <span className="ig-condensed text-[13px] font-semibold leading-none text-[hsl(var(--paper))]">
                  {i + 1}
                </span>
              )}
              {subjective && (
                <span
                  aria-hidden
                  className="absolute"
                  style={{
                    right: 0, bottom: 0, width: 0, height: 0,
                    borderStyle: 'solid', borderWidth: '0 0 8px 8px',
                    borderColor: 'transparent transparent hsl(var(--paper)) transparent',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {showLegend && (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {(['easy', 'medium', 'hard', 'very_hard'] as Difficulty[]).map((k) => (
            <span key={k} className="ig-leg">
              <span className="ig-leg-dot ig-print-color" style={{ background: `hsl(var(${DIFF_TONE[k]}))`, borderRadius: 2 }} />
              <span className="ig-leg-l">{DIFF_LABEL[k]}</span>
            </span>
          ))}
          <span className="ig-leg">
            <span className="ig-leg-dot relative" style={{ background: 'hsl(var(--ig-slate))', borderRadius: 2 }}>
              <span aria-hidden className="absolute" style={{ right: 0, bottom: 0, width: 0, height: 0, borderStyle: 'solid', borderWidth: '0 0 5px 5px', borderColor: 'transparent transparent hsl(var(--paper)) transparent' }} />
            </span>
            <span className="ig-leg-l">서답형</span>
          </span>
          <span className="ig-leg">
            <span className="ig-leg-dot" style={{ background: 'transparent', border: '2px solid hsl(var(--ink) / 0.55)', borderRadius: 2, boxSizing: 'border-box' }} />
            <span className="ig-leg-l">최고난도</span>
          </span>
        </div>
      )}
    </div>
  );
};

export default IgUnitGrid;
