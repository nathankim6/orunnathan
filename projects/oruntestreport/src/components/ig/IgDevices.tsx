import React from 'react';
import { DIFFICULTIES, DIFF_TONE, type DiffCount, type Difficulty } from '@/lib/reportStats';

type Problem = { difficulty: Difficulty; questionType?: 'objective' | 'subjective'; isKiller?: boolean };

/**
 * 기기 목업 넷 — 모니터·노트북·태블릿·스마트폰.
 *
 * 레퍼런스 "VECTOR ACCESSORIES / ELECTRONIC DEVICES" 다. 기기 틀은 잉크색 납작
 * 사각형이고 화면 안에는 이 리포트의 실제 데이터를 작게 다시 그린다(모니터 =
 * 출제 유형 도넛, 노트북 = 문항 지도, 태블릿 = 난도 막대, 스마트폰 = 제출 화면).
 * 전부 SVG 라 캡처·인쇄에서 그대로 찍힌다.
 */
const IgDevices: React.FC<{
  categories: { tone: string; count: number }[];
  problems?: Problem[];
  byDifficulty: DiffCount;
  className?: string;
}> = ({ categories, problems, byDifficulty, className = '' }) => {
  const W = 580, H = 172;
  const ink = 'hsl(var(--ink))';
  const paper = 'hsl(var(--paper))';
  const f = (n: number) => n.toFixed(1);

  // 모니터 안 도넛
  const catTotal = categories.reduce((s, c) => s + c.count, 0) || 1;
  const R = 29, C = 2 * Math.PI * R;
  let acc = 0;
  const arcs = categories.filter((c) => c.count > 0).map((c) => {
    const frac = c.count / catTotal;
    const len = Math.max(0, frac * C - 1);
    const a = { tone: c.tone, len, off: -acc * C };
    acc += frac;
    return a;
  });

  // 노트북 안 문항 지도
  const list = problems || [];
  const n = list.length;
  const cols = n <= 35 ? 7 : 10;
  const rows = Math.max(1, Math.ceil(n / cols));
  const gap = n <= 35 ? 3 : 2;
  const cell = Math.max(3, Math.min(13, Math.floor((82 - (rows - 1) * gap) / rows), Math.floor((136 - (cols - 1) * gap) / cols)));
  const gridW = cols * cell + (cols - 1) * gap;
  const gridH = rows * cell + (rows - 1) * gap;
  const gx = 247 + (136 - gridW) / 2;
  const gy = 43 + (82 - gridH) / 2;

  // 태블릿 안 난도 막대
  const maxD = Math.max(1, ...DIFFICULTIES.map((d) => byDifficulty[d]));

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={W}
      height={H}
      preserveAspectRatio="xMidYMid meet"
      style={{ width: '100%', height: 'auto', display: 'block' }}
      role="img"
      aria-label="모니터·노트북·태블릿·스마트폰 화면의 리포트"
      className={className}
    >
      {/* 모니터 */}
      <rect x="16" y="14" width="196" height="124" rx="6" fill={ink} />
      <rect x="24" y="22" width="180" height="108" fill={paper} />
      <rect x="104" y="138" width="20" height="14" fill={ink} />
      <rect x="76" y="152" width="76" height="6" rx="2" fill={ink} />
      <circle cx="114" cy="76" r={R} fill="none" stroke="hsl(var(--ink) / 0.08)" strokeWidth="11" />
      {arcs.map((a, i) => (
        <circle key={i} cx="114" cy="76" r={R} fill="none" stroke={`hsl(var(${a.tone}))`} strokeWidth="11"
                strokeDasharray={`${f(a.len)} ${f(C - a.len)}`} strokeDashoffset={f(a.off)} transform="rotate(-90 114 76)" />
      ))}
      <rect x="154" y="52" width="40" height="3" fill="hsl(var(--ink) / 0.25)" />
      <rect x="154" y="61" width="30" height="3" fill="hsl(var(--ink) / 0.15)" />
      <rect x="154" y="70" width="34" height="3" fill="hsl(var(--ink) / 0.15)" />
      <rect x="34" y="52" width="40" height="3" fill="hsl(var(--ink) / 0.25)" />
      <rect x="34" y="61" width="26" height="3" fill="hsl(var(--ink) / 0.15)" />

      {/* 노트북 */}
      <rect x="240" y="36" width="150" height="96" rx="5" fill={ink} />
      <rect x="247" y="43" width="136" height="82" fill={paper} />
      <path d="M226,132 H404 V139 Q404,146 397,146 H233 Q226,146 226,139 Z" fill={ink} />
      {n === 0 && <rect x="262" y="70" width="106" height="28" fill="hsl(var(--ink) / 0.08)" />}
      {list.map((p, i) => {
        const d = DIFFICULTIES.includes(p.difficulty) ? p.difficulty : 'medium';
        const x = gx + (i % cols) * (cell + gap);
        const y = gy + Math.floor(i / cols) * (cell + gap);
        const killer = !!p.isKiller || d === 'very_hard';
        return <rect key={i} x={f(x)} y={f(y)} width={cell} height={cell} fill={`hsl(var(${DIFF_TONE[d]}))`}
                     stroke={killer ? 'hsl(var(--ink) / 0.6)' : 'none'} strokeWidth={killer ? 1 : 0} />;
      })}

      {/* 태블릿 */}
      <rect x="420" y="24" width="84" height="122" rx="8" fill={ink} />
      <rect x="427" y="34" width="70" height="96" fill={paper} />
      <circle cx="462" cy="139" r="3" fill="hsl(var(--paper) / 0.5)" />
      {DIFFICULTIES.map((d, i) => {
        const h = Math.max(3, (byDifficulty[d] / maxD) * 66);
        return <rect key={d} x={433 + i * 15} y={f(122 - h)} width="11" height={f(h)} fill={`hsl(var(${DIFF_TONE[d]}))`} />;
      })}
      <rect x="433" y="122" width="56" height="1.5" fill="hsl(var(--ink) / 0.3)" />
      <rect x="433" y="42" width="44" height="3" fill="hsl(var(--ink) / 0.25)" />

      {/* 스마트폰 */}
      <rect x="522" y="46" width="44" height="100" rx="7" fill={ink} />
      <rect x="526" y="55" width="36" height="82" fill={paper} />
      <rect x="538" y="50" width="12" height="2" rx="1" fill="hsl(var(--paper) / 0.4)" />
      <rect x="531" y="62" width="26" height="3" fill="hsl(var(--ink) / 0.3)" />
      <rect x="531" y="70" width="20" height="3" fill="hsl(var(--ink) / 0.15)" />
      <rect x="531" y="78" width="26" height="3" fill="hsl(var(--ink) / 0.15)" />
      <rect x="531" y="86" width="16" height="3" fill="hsl(var(--ink) / 0.15)" />
      <rect x="531" y="120" width="26" height="10" rx="2" fill="hsl(var(--ig-coral))" />
      <rect x="531" y="100" width="26" height="12" rx="2" fill="none" stroke="hsl(var(--ink) / 0.35)" strokeWidth="1" />
    </svg>
  );
};

export default IgDevices;
