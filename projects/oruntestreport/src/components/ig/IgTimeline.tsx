import React from 'react';

export interface TimelineEntry {
  /** 왼쪽 칩에 들어갈 짧은 라벨 (예: 상위권, 2013) */
  label: string;
  title?: string;
  body: string;
  /** 팔레트 토큰 이름 */
  tone?: string;
}

/**
 * 세로 타임라인.
 *
 * 레퍼런스 "TIMELINE INFOGRAPHICS / MODERN TIMELINE" 의 어법이다. 왼쪽에 가는 세로선,
 * 항목마다 선 위에 색 점 하나, 그 옆에 색 칩 라벨과 글. 순서가 있는 것(연도, 단계,
 * 수준)에 쓴다. 장식이 아니라 "차례"를 눈으로 읽게 하는 장치다.
 */
const IgTimeline: React.FC<{ entries: TimelineEntry[]; className?: string }> = ({ entries, className = '' }) => {
  if (!entries || entries.length === 0) return null;
  return (
    <ol className={`relative ${className}`} style={{ paddingLeft: 26 }}>
      {/* 세로선 */}
      <span aria-hidden className="absolute" style={{ left: 7, top: 6, bottom: 6, width: 2, background: 'hsl(var(--ink) / 0.14)' }} />
      {entries.map((e, i) => {
        const tone = e.tone ?? ['--ig-coral', '--ig-teal', '--ig-navy', '--ig-sand', '--ig-slate'][i % 5];
        return (
          <li key={i} className="relative" style={{ paddingBottom: i === entries.length - 1 ? 0 : 18 }}>
            {/* 점 */}
            <span
              aria-hidden
              className="absolute rounded-full"
              style={{
                left: -26 + 2, top: 5, width: 12, height: 12,
                background: `hsl(var(${tone}))`,
                boxShadow: '0 0 0 3px hsl(var(--paper))',
              }}
            />
            <div className="flex flex-wrap items-center gap-2">
              <span className="ig-chip" style={{ background: `hsl(var(${tone}))` }}>{e.label}</span>
              {e.title && (
                <span className="font-display text-[13.5px] font-bold text-[hsl(var(--ink))]" style={{ wordBreak: 'keep-all' }}>
                  {e.title}
                </span>
              )}
            </div>
            <p className="ig-col-b rp-prose" style={{ marginTop: 6 }}>{e.body}</p>
          </li>
        );
      })}
    </ol>
  );
};

export default IgTimeline;

/**
 * "상위권 — …\n\n중위권 — …\n\n하위권 — …" 꼴의 글을 타임라인 항목으로 나눈다.
 * 두 단 이상 못 찾으면 null 을 돌려주고, 부르는 쪽은 문단 그대로 보여 준다.
 */
export const parseTiers = (text?: string): TimelineEntry[] | null => {
  if (!text) return null;
  const re = /^\s*(최상위권|상위권|중상위권|중위권|중하위권|하위권|기초)\s*[—–\-:：]\s*/;
  const chunks = text.split(/\n\s*\n/).map((c) => c.trim()).filter(Boolean);
  const out: TimelineEntry[] = [];
  const TONES: Record<string, string> = {
    최상위권: '--ig-coral', 상위권: '--ig-coral', 중상위권: '--ig-sand',
    중위권: '--ig-teal', 중하위권: '--ig-slate', 하위권: '--ig-navy', 기초: '--ig-navy',
  };
  for (const c of chunks) {
    const m = c.match(re);
    if (!m) continue;
    out.push({ label: m[1], body: c.slice(m[0].length).trim(), tone: TONES[m[1]] });
  }
  return out.length >= 2 ? out : null;
};
