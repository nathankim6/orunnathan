import React, { useMemo } from 'react';

type Problem = {
  id?: string;
  name?: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'very_hard';
  isKiller?: boolean;
  points?: number;
};

const LEVEL: Record<Problem['difficulty'], number> = { easy: 1, medium: 2, hard: 3, very_hard: 4 };
const ROWS: { key: Problem['difficulty']; label: string; token: string }[] = [
  { key: 'very_hard', label: '매우 어려움', token: '--ig-coral' },
  { key: 'hard', label: '어려움', token: '--ig-sand' },
  { key: 'medium', label: '보통', token: '--ig-slate' },
  { key: 'easy', label: '쉬움', token: '--ig-teal' },
];

/**
 * 문항 순서로 본 난도 흐름.
 *
 * 예전에는 이 자리를 어두운 3차원 능선이 차지했다. 학부모가 받아 보는
 * 보고서에서는 볼거리보다 읽히는 게 먼저라, 레퍼런스의 선그래프 어법으로
 * 바꾼다. 가로는 문항 번호, 세로는 난도 네 칸이다. 점 하나가 문항 하나이고,
 * 색이 곧 난도다. 킬러 문항에는 테두리를 한 겹 둘러 눈에 걸리게 한다.
 *
 * 선이 위로 솟은 구간이 어디서 점수가 갈렸는지를 그대로 보여 준다.
 */
const DifficultyFlow: React.FC<{
  problems?: Problem[];
  className?: string;
  /** 뷰박스 높이 */
  height?: number;
  /** 킬러 고리 — isKiller 필드가 실제로 있는 리포트에서만 */
  showKillerRing?: boolean;
}> = ({
  problems,
  className = '',
  height = 208,
  showKillerRing = true,
}) => {
  const list = problems || [];
  const n = list.length;

  const geom = useMemo(() => {
    const W = 720;
    const H = height;
    const padL = 78;
    const padR = 14;
    const padT = 24;
    const padB = 30;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;
    const step = n > 1 ? plotW / (n - 1) : 0;
    const rowY = (lvl: number) => padT + (4 - lvl) * (plotH / 3);

    const pts = list.map((p, i) => ({
      x: padL + (n > 1 ? i * step : plotW / 2),
      y: rowY(LEVEL[p.difficulty] ?? 2),
      p,
      i,
    }));
    return { W, H, padL, padR, padT, padB, plotW, plotH, rowY, pts };
  }, [list, n, height]);

  if (n === 0) return null;

  const { W, H, padL, padR, rowY, pts } = geom;
  const line = pts.map((pt) => `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(' ');
  // 눈금: 문항이 32 이하면 짝수 번호 전부, 그보다 많으면 5 배수만.
  const isTick = (i: number) => (n <= 32 ? (i + 1) % 2 === 0 || i === 0 : (i + 1) % 5 === 0 || i === 0);

  return (
    <div className={className}>
      {/* width·height 를 함께 준다. viewBox 만 있으면 캡처 도구가 고유 크기를
          알 수 없어 엉뚱하게 키운다. 화면에서는 css 가 폭을 맞춘다. */}
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}
           preserveAspectRatio="xMidYMid meet"
           style={{ width: '100%', height: 'auto', display: 'block' }}
           role="img" aria-label="문항 순서에 따른 난도 흐름">
        {/* 가로 눈금선과 난도 이름 */}
        {ROWS.map((r) => {
          const y = rowY(LEVEL[r.key]);
          return (
            <g key={r.key}>
              <line x1={padL} y1={y} x2={W - padR} y2={y}
                    stroke="hsl(var(--ink) / 0.09)" strokeWidth="1" />
              <text x={padL - 10} y={y + 3.5} textAnchor="end"
                    fontFamily="'Noto Sans KR', sans-serif"
                    fontSize="10" fontWeight="700" letterSpacing="0.02em"
                    fill="hsl(var(--ink) / 0.55)">
                {r.label}
              </text>
            </g>
          );
        })}

        {/* 흐름선 — 점을 잇기만 한다 */}
        <polyline points={line} fill="none" stroke="hsl(var(--ink) / 0.18)" strokeWidth="1"
                  strokeLinejoin="round" strokeLinecap="round" />

        {/* 문항 하나가 점 하나 */}
        {pts.map((pt) => {
          const row = ROWS.find((r) => r.key === pt.p.difficulty) ?? ROWS[2];
          const veryHard = pt.p.difficulty === 'very_hard';
          const killer = showKillerRing && (!!pt.p.isKiller || veryHard);
          return (
            <g key={pt.i}>
              {killer && (
                <circle cx={pt.x} cy={pt.y} r="7" fill="none"
                        stroke={`hsl(var(${row.token}) / 0.35)`} strokeWidth="1.6" />
              )}
              <circle cx={pt.x} cy={pt.y} r="4" fill={`hsl(var(${row.token}))`} />
              {veryHard && (
                <text x={pt.x} y={pt.y - 11} textAnchor="middle"
                      fontFamily="Oswald, 'Noto Sans KR', sans-serif" fontWeight="600" fontSize="10"
                      fill="hsl(var(--ig-coral))">
                  {pt.i + 1}
                </text>
              )}
            </g>
          );
        })}

        {/* 문항 번호 */}
        {pts.map((pt) =>
          isTick(pt.i) || pt.i === n - 1 ? (
            <text key={`t${pt.i}`} x={pt.x} y={H - 10} textAnchor="middle"
                  fontFamily="Oswald, 'Noto Sans KR', sans-serif"
                  fontSize="9.5" fontWeight="600" fill="hsl(var(--ink) / 0.45)">
              {pt.i + 1}
            </text>
          ) : null,
        )}
      </svg>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
        {ROWS.slice().reverse().map((r) => (
          <span key={r.key} className="ig-leg">
            <span className="ig-leg-dot" style={{ background: `hsl(var(${r.token}))` }} />
            <span className="ig-leg-l">{r.label}</span>
          </span>
        ))}
        {showKillerRing && (
          <span className="ig-leg">
            <span className="ig-leg-dot"
                  style={{ background: 'transparent', border: '1.6px solid hsl(var(--ig-coral) / 0.5)', boxSizing: 'border-box' }} />
            <span className="ig-leg-l">킬러 문항</span>
          </span>
        )}
      </div>
    </div>
  );
};

export default DifficultyFlow;
