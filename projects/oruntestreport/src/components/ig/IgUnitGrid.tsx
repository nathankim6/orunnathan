import React from 'react';

type Problem = {
  id?: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'very_hard';
  questionType?: 'objective' | 'subjective';
  isKiller?: boolean;
};

const TONE: Record<Problem['difficulty'], string> = {
  easy: '--ig-teal',
  medium: '--ig-slate',
  hard: '--ig-sand',
  very_hard: '--ig-coral',
};

/**
 * 단위 차트 — 문항 하나가 칸 하나.
 *
 * 레퍼런스의 픽토그램 어법이다(사람 하나가 단위 하나). 여기서는 사각 칸 하나가
 * 문항 하나이고, 색이 난도다. 한 줄에 열 칸씩 놓으면 "28문항 중 6문항이 킬러"가
 * 세지 않아도 보인다. 서답형은 칸 안에 작은 흰 점을 찍어 구분하고, 킬러 문항은
 * 칸 둘레에 진한 테두리를 두른다.
 *
 * div 로만 그린다. 캡처에서 가장 안전하다.
 */
const IgUnitGrid: React.FC<{
  problems?: Problem[];
  cols?: number;
  /** 칸 한 변 (px) */
  cell?: number;
  gap?: number;
  showLegend?: boolean;
  className?: string;
}> = ({ problems, cols = 10, cell = 22, gap = 4, showLegend = true, className = '' }) => {
  const list = problems || [];
  if (list.length === 0) return null;

  return (
    <div className={className}>
      <div
        className="grid"
        style={{ gridTemplateColumns: `repeat(${cols}, ${cell}px)`, gap, justifyContent: 'start' }}
        role="img"
        aria-label={`문항 ${list.length}개의 난도 지도`}
      >
        {list.map((p, i) => {
          const killer = p.isKiller || p.difficulty === 'very_hard';
          const subjective = p.questionType === 'subjective';
          return (
            <div
              key={p.id ?? i}
              title={`${i + 1}번`}
              className="relative"
              style={{
                width: cell,
                height: cell,
                background: `hsl(var(${TONE[p.difficulty] ?? '--ig-slate'}))`,
                boxShadow: killer ? `inset 0 0 0 2px hsl(var(--ink) / 0.55)` : undefined,
              }}
            >
              {subjective && (
                <span
                  className="absolute rounded-full"
                  style={{
                    width: Math.max(4, cell * 0.22),
                    height: Math.max(4, cell * 0.22),
                    left: '50%', top: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'hsl(0 0% 100% / 0.9)',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {showLegend && (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {(['easy', 'medium', 'hard', 'very_hard'] as const).map((k) => (
            <span key={k} className="ig-leg">
              <span className="ig-leg-dot" style={{ background: `hsl(var(${TONE[k]}))`, borderRadius: 2 }} />
              <span className="ig-leg-l">
                {k === 'easy' ? '쉬움' : k === 'medium' ? '보통' : k === 'hard' ? '어려움' : '매우 어려움'}
              </span>
            </span>
          ))}
          <span className="ig-leg">
            <span className="ig-leg-dot" style={{ background: 'transparent', boxShadow: 'inset 0 0 0 2px hsl(var(--ink) / 0.55)', borderRadius: 2 }} />
            <span className="ig-leg-l">킬러</span>
          </span>
          <span className="ig-leg">
            <span className="ig-leg-dot relative" style={{ background: 'hsl(var(--ig-slate))', borderRadius: 2 }}>
              <span className="absolute rounded-full" style={{ width: 4, height: 4, left: 3, top: 3, background: '#fff' }} />
            </span>
            <span className="ig-leg-l">서답형</span>
          </span>
        </div>
      )}
    </div>
  );
};

export default IgUnitGrid;
