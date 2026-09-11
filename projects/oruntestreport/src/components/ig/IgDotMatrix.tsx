import React from 'react';

type Problem = { difficulty: 'easy' | 'medium' | 'hard' | 'very_hard'; questionType?: 'objective' | 'subjective'; isKiller?: boolean };

/**
 * 제호의 점 매트릭스 — 문항 하나가 점 하나.
 *
 * 레퍼런스의 점 무늬를 데이터로 바꾼 것이다. 점 28개 = 문항 28개. 최고난도는
 * 코랄, 서답형은 원 대신 사각(형태로도 구분). 데이터 없는 장식 무늬는 두지
 * 않는다. 문항이 아주 많으면(60 초과) 점 크기를 줄여 무늬로만 남긴다.
 */
const IgDotMatrix: React.FC<{ problems?: Problem[]; cols?: number; className?: string }> = ({ problems, cols = 7, className = '' }) => {
  const list = problems || [];
  const n = list.length;
  if (n === 0) return null;
  const many = n > 60;
  const c = many ? 14 : cols;
  const rows = Math.ceil(n / c);
  const step = 12;
  const W = c * step;
  const H = rows * step;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={W}
      height={H}
      preserveAspectRatio="xMidYMid meet"
      style={{ width: W, height: H, display: 'block', pointerEvents: 'none' }}
      className={className}
      aria-hidden="true"
    >
      {list.map((p, i) => {
        const cx = (i % c) * step + step / 2;
        const cy = Math.floor(i / c) * step + step / 2;
        const killer = !!p.isKiller || p.difficulty === 'very_hard';
        const fill = many ? 'hsl(var(--ink) / 0.08)' : killer ? 'hsl(var(--ig-coral))' : 'hsl(var(--ink) / 0.16)';
        return p.questionType === 'subjective' && !many ? (
          <rect key={i} x={cx - 3} y={cy - 3} width={6} height={6} fill={fill} />
        ) : (
          <circle key={i} cx={cx} cy={cy} r={many ? 1.6 : 3} fill={fill} />
        );
      })}
    </svg>
  );
};

export default IgDotMatrix;
