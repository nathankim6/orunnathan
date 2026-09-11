import React from 'react';
import IgHeaderCard from '@/components/ig/IgHeaderCard';
export { parseTiers } from '@/lib/reportStats';

export interface TimelineEntry {
  /** 상위권 */
  label: string;
  /** TOP */
  labelEn?: string;
  body: string;
  /** 팔레트 토큰 이름 */
  tone?: string;
}

/**
 * 세로 타임라인.
 *
 * 레퍼런스 "TIMELINE INFOGRAPHICS / MODERN TIMELINE" 의 어법이다. 왼쪽 세로선은
 * ol 의 border-left 로 긋는다 — 절대 위치 선은 페이지가 나뉘면 끊기지만 border
 * 는 각 장에서 이어진다. 항목마다 선 위에 색 점(실제 span, 흰 테는 border),
 * 색 헤더 띠, 본문. 순서가 있는 것(수준, 단계)에 쓴다.
 */
const IgTimeline: React.FC<{ entries: TimelineEntry[]; className?: string }> = ({ entries, className = '' }) => {
  if (!entries || entries.length === 0) return null;
  const TONES = ['--ig-coral', '--ig-sand', '--ig-teal', '--ig-navy', '--ig-slate'];
  return (
    <ol
      className={`list-none m-0 ${className}`}
      style={{ borderLeft: '2px solid hsl(var(--ink) / 0.14)', paddingLeft: 22, marginLeft: 6 }}
    >
      {entries.map((e, i) => {
        const tone = e.tone ?? TONES[i % TONES.length];
        return (
          <li key={i} className="relative" style={{ paddingBottom: i === entries.length - 1 ? 0 : 18, breakInside: 'avoid' }}>
            <span
              aria-hidden
              className="absolute rounded-full ig-print-color"
              style={{
                left: -31, top: 6, width: 14, height: 14, boxSizing: 'border-box',
                background: `hsl(var(${tone}))`,
                border: '3px solid hsl(var(--paper))',
              }}
            />
            <IgHeaderCard tone={tone} title={e.label} titleEn={e.labelEn} />
            <p className="ig-col-b rp-prose" style={{ marginTop: 8, color: 'hsl(var(--ink))', fontSize: 12.5, lineHeight: 1.8 }}>
              {e.body}
            </p>
          </li>
        );
      })}
    </ol>
  );
};

export default IgTimeline;
