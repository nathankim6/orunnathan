import React from 'react';

export interface IsoSlice {
  label: string;
  value: number;
  /** 팔레트 토큰 이름 */
  tone: string;
}

/**
 * 아이소메트릭(눕힌) 파이.
 *
 * 레퍼런스 "ISOMETRIC VIEWS / STUNNING DESIGN" 의 그 파이다. 타원 윗면을 조각으로
 * 나누고, 앞쪽(아래쪽 반) 조각에는 어두운 옆면을 세운다. 그림자·그라데이션은
 * 없다 — 옆면은 같은 색 위에 잉크를 한 겹 얹어 어둡게 한다. 조각마다 위로 인출선을
 * 빼서 라벨을 단다. 값 0 조각은 그리지 않는다.
 *
 * 각도는 12시에서 시계 방향. SVG 는 y 가 아래로 자라므로 sin > 0 이 앞쪽이다.
 */
const IgIsoPie: React.FC<{
  slices: IsoSlice[];
  /** 라벨 둘째 줄 — 예: s => `${s.value}문항 · ${pct}%` */
  sub?: (s: IsoSlice, pct: number) => string;
  className?: string;
}> = ({ slices, sub, className = '' }) => {
  const live = slices.filter((s) => (s.value || 0) > 0);
  const total = live.reduce((a, s) => a + s.value, 0) || 1;
  const W = 240, H = 214;
  const cx = 120, cy = 136, rx = 76, ry = 42, depth = 18;
  const P = (a: number, dy = 0) => ({ x: cx + rx * Math.cos(a), y: cy + ry * Math.sin(a) + dy });
  const f = (n: number) => n.toFixed(2);

  let start = -Math.PI / 2;
  const parts = live.map((s) => {
    const span = (s.value / total) * 2 * Math.PI;
    const a0 = start; const a1 = start + span; start = a1;
    return { s, a0, a1, mid: (a0 + a1) / 2, pct: Math.round((s.value / total) * 100) };
  });

  const top = (a0: number, a1: number) => {
    if (a1 - a0 >= 2 * Math.PI - 1e-6) return `M${f(cx - rx)},${f(cy)} A${rx},${ry} 0 1 1 ${f(cx + rx)},${f(cy)} A${rx},${ry} 0 1 1 ${f(cx - rx)},${f(cy)} Z`;
    const p0 = P(a0), p1 = P(a1);
    const large = a1 - a0 > Math.PI ? 1 : 0;
    return `M${f(cx)},${f(cy)} L${f(p0.x)},${f(p0.y)} A${rx},${ry} 0 ${large} 1 ${f(p1.x)},${f(p1.y)} Z`;
  };
  // 앞쪽 옆면: 각도 (0, π) 구간만 보인다. 한 바퀴를 넘는 조각은 두 번 잘라 본다.
  const walls = (a0: number, a1: number) => {
    const out: string[] = [];
    for (const off of [0, 2 * Math.PI]) {
      const lo = Math.max(a0 - off, 0), hi = Math.min(a1 - off, Math.PI);
      if (hi - lo > 0.005) {
        const p0 = P(lo), p1 = P(hi), q0 = P(lo, depth), q1 = P(hi, depth);
        out.push(`M${f(p0.x)},${f(p0.y)} L${f(q0.x)},${f(q0.y)} A${rx},${ry} 0 0 1 ${f(q1.x)},${f(q1.y)} L${f(p1.x)},${f(p1.y)} A${rx},${ry} 0 0 0 ${f(p0.x)},${f(p0.y)} Z`);
      }
    }
    return out;
  };

  // 라벨은 위쪽에 두 줄로 번갈아 놓고(겹침 방지), 조각 가장자리 x 순서대로
  // 왼쪽부터 배정해 인출선이 서로 엇갈리지 않게 한다.
  const n = parts.length;
  const edgeOf = (p: { mid: number }) => P(p.mid, p.mid > 0 && p.mid < Math.PI ? depth : 0);
  const order = parts.map((p, i) => ({ i, x: edgeOf(p).x })).sort((a, b) => a.x - b.x).map((o) => o.i);
  const slotOf = (i: number) => order.indexOf(i);
  const labelX = (slot: number) => (n === 1 ? W / 2 : 30 + (slot * (W - 60)) / (n - 1));
  const rowOf = (slot: number) => (n <= 2 ? 0 : slot % 2);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={W}
      height={H}
      preserveAspectRatio="xMidYMid meet"
      style={{ width: '100%', height: 'auto', display: 'block' }}
      role="img"
      aria-label={live.map((s) => `${s.label} ${s.value}`).join(', ')}
      className={className}
    >
      {parts.map((p, i) => walls(p.a0, p.a1).map((d, j) => (
        <g key={`w${i}-${j}`}>
          <path d={d} fill={`hsl(var(${p.s.tone}))`} />
          <path d={d} fill="hsl(var(--ink) / 0.3)" />
        </g>
      )))}
      {parts.map((p, i) => (
        <path key={`t${i}`} d={top(p.a0, p.a1)} fill={`hsl(var(${p.s.tone}))`} stroke="hsl(var(--paper))" strokeWidth="1" />
      ))}
      {parts.map((p, i) => {
        const e = edgeOf(p);
        const slot = slotOf(i);
        const lx = labelX(slot);
        const top = rowOf(slot) * 30;
        const ly = top + 30;
        return (
          <g key={`l${i}`}>
            <polyline points={`${f(lx)},${ly + 2} ${f(lx)},${ly + 12} ${f(e.x)},${f(e.y)}`} fill="none" stroke="hsl(var(--ink) / 0.4)" strokeWidth="1" />
            <circle cx={f(e.x)} cy={f(e.y)} r="2.2" fill="hsl(var(--ink))" />
            <text x={f(lx)} y={top + 12} textAnchor="middle" fontFamily="'Noto Sans KR', sans-serif" fontWeight="700" fontSize="10.5" fill="hsl(var(--ink))">{p.s.label}</text>
            <text x={f(lx)} y={top + 25} textAnchor="middle" fontFamily="Oswald, 'Noto Sans KR', sans-serif" fontWeight="600" fontSize="11" fill={`hsl(var(${p.s.tone}))`}>
              {sub ? sub(p.s, p.pct) : `${p.pct}%`}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export default IgIsoPie;
