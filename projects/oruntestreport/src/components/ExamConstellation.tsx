import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { ConstellationHandle, ConstellationNode } from '@/scene/examConstellation';

/**
 * 이번 시험의 난도 능선 — 리포트 안에 들어가는 유일한 3차원 화면.
 *
 * 막대그래프는 난도가 몇 개씩인지는 보여 주지만 "어디에" 몰렸는지는 못 보여
 * 준다. 문항을 번호 순서대로 늘어놓고 난도만큼 띄우면, 어려운 문항이 앞에
 * 몰렸는지 뒤로 갈수록 가팔라지는지가 한눈에 보인다.
 *
 * 리포트에 그대로 인쇄되므로(캔버스를 캡처한다) 배경은 어둡게 두고 점만
 * 밝게 띄운다. 흰 종이 위에 필름 한 컷이 끼워진 것처럼 보이게 하려는 것이다.
 */

type Problem = {
  id?: string;
  name?: string;
  category?: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'very_hard';
  questionType: 'objective' | 'subjective';
  isKiller?: boolean;
};

/** '--diff-easy' 같은 토큰(예: "188 30% 36%")을 색 문자열로 바꾼다. */
const tokenColor = (name: string, fallback: string): string => {
  if (typeof window === 'undefined') return fallback;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  if (!raw) return fallback;
  const parts = raw.split(/\s+/);
  if (parts.length < 3) return fallback;
  return `hsl(${parts[0]}, ${parts[1]}, ${parts[2]})`;
};

const DIFF_LABEL: Record<Problem['difficulty'], string> = {
  easy: '쉬움',
  medium: '보통',
  hard: '어려움',
  very_hard: '매우 어려움',
};

const ExamConstellation: React.FC<{ problems: Problem[] }> = ({ problems }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleRef = useRef<ConstellationHandle | null>(null);
  const [hover, setHover] = useState<{ node: ConstellationNode; x: number; y: number } | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');

  const nodes = useMemo<ConstellationNode[]>(
    () =>
      problems.map((p, i) => ({
        number: i + 1,
        name: p.name || '유형 미지정',
        category: p.category || '',
        difficulty: p.difficulty,
        questionType: p.questionType,
        isKiller: p.isKiller || p.difficulty === 'very_hard',
      })),
    [problems],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || nodes.length === 0) return;
    let handle: ConstellationHandle | null = null;
    let cancelled = false;

    // three.js 는 리포트 화면에서만 쓴다 — 여기서 내려받아 첫 로딩을 가볍게.
    void import('@/scene/examConstellation').then(({ createExamConstellation }) => {
      if (cancelled) return;
      handle = createExamConstellation(
      canvas,
      nodes,
      {
        easy: tokenColor('--diff-easy', 'hsl(188, 30%, 36%)'),
        medium: tokenColor('--diff-mid', 'hsl(214, 20%, 44%)'),
        hard: tokenColor('--diff-hard', 'hsl(30, 44%, 46%)'),
        very_hard: tokenColor('--diff-xhard', 'hsl(8, 44%, 44%)'),
        line: tokenColor('--gold-soft', 'hsl(188, 26%, 62%)'),
        base: tokenColor('--ink', 'hsl(220, 20%, 13%)'),
      },
      (node, screen) => setHover(node ? { node, x: screen.x, y: screen.y } : null),
      );
      handleRef.current = handle;
      setStatus(handle ? 'ready' : 'failed');
    });

    return () => {
      cancelled = true;
      handle?.dispose();
      handleRef.current = null;
      setStatus('loading');
    };
  }, [nodes]);

  if (nodes.length === 0) return null;

  const legend: Array<{ key: Problem['difficulty']; token: string }> = [
    { key: 'easy', token: '--diff-easy' },
    { key: 'medium', token: '--diff-mid' },
    { key: 'hard', token: '--diff-hard' },
    { key: 'very_hard', token: '--diff-xhard' },
  ];

  return (
    <section className="report-section">
      <div className="rp-card overflow-hidden p-0 md:p-0">
        <div className="flex flex-wrap items-end justify-between gap-3 px-5 pt-5 md:px-6 md:pt-6">
          <div className="rp-head" style={{ ['--tone' as never]: 'var(--c2)' }}>
            <span className="rp-glyph">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 17.5 8 9l4 5 3-4.5 5 8" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="8" cy="9" r="1.4" fill="currentColor" stroke="none" />
                <circle cx="15" cy="9.5" r="1.4" fill="currentColor" stroke="none" />
              </svg>
            </span>
            <div className="flex flex-col gap-1">
              <span className="rp-label">난도 능선</span>
              <h3 className="rp-section-title text-[17px] md:text-[19px]">문항 순서로 본 난도 흐름</h3>
            </div>
          </div>
          <p className="text-[11.5px] text-[hsl(var(--ink-soft))] break-keep capture-hide print:hidden">
            끌어서 돌려 보고, 점 위에 올리면 문항이 나옵니다.
          </p>
        </div>

        <div className="relative mt-4 md:mt-5">
          <canvas
            ref={canvasRef}
            className="block w-full"
            style={{ height: 'clamp(240px, 30vw, 330px)', touchAction: 'none' }}
          />
          {status === 'failed' && (
            <div className="absolute inset-0 flex items-center justify-center text-[12px] text-[hsl(var(--ink-soft))]">
              이 브라우저에서는 입체 화면을 그릴 수 없습니다.
            </div>
          )}
          {hover && (
            <div
              className="pointer-events-none absolute z-10 rounded-lg px-3 py-2 capture-hide print:hidden"
              style={{
                left: Math.min(Math.max(hover.x, 90), (canvasRef.current?.clientWidth ?? 600) - 90),
                top: Math.max(8, hover.y - 68),
                transform: 'translateX(-50%)',
                background: 'hsl(var(--paper))',
                boxShadow: '0 1px 2px hsl(var(--ink)/0.1), 0 10px 24px -12px hsl(var(--ink)/0.5)',
                border: '1px solid hsl(var(--ink)/0.1)',
              }}
            >
              <p className="text-[12px] font-bold text-[hsl(var(--ink))] whitespace-nowrap">
                {hover.node.number}번 · {hover.node.name}
              </p>
              <p className="mt-0.5 text-[11px] text-[hsl(var(--ink-soft))] whitespace-nowrap">
                {hover.node.category ? `${hover.node.category} · ` : ''}
                {hover.node.questionType === 'objective' ? '객관식' : '서답형'} ·{' '}
                {DIFF_LABEL[hover.node.difficulty]}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-5 py-4 md:px-6 md:py-5">
          {legend.map((item) => (
            <span key={item.key} className="rp-legend-item">
              <span className="rp-dot" style={{ background: `hsl(var(${item.token}))` }} />
              {DIFF_LABEL[item.key]}
            </span>
          ))}
          <span className="rp-legend-item">
            <span
              className="rp-dot"
              style={{ background: 'transparent', boxShadow: 'inset 0 0 0 1.5px hsl(var(--ink) / 0.45)' }}
            />
            킬러 문항
          </span>
          <span className="ml-auto text-[11px] text-[hsl(var(--ink-soft))]">
            왼쪽이 1번, 오른쪽이 {nodes.length}번 · 높이가 난도
          </span>
        </div>
      </div>
    </section>
  );
};

export default ExamConstellation;
