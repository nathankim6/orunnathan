import React from 'react';
import { CheckSquare, PenLine, Flame, GitCompare, Shuffle } from 'lucide-react';
import IgIconTile from '@/components/ig/IgIconTile';
import { DIFFICULTIES, DIFF_LABEL, DIFF_TONE, TYPE_TONE, type ReportStats } from '@/lib/reportStats';

/**
 * 범례 푸터.
 *
 * 레퍼런스 "USEFUL ICONS" 의 색 타일 줄과 마름모 글머리 목록이다. 타일 하나가
 * 숫자 하나(객관식·서답형·최고난도·원문 대조·변형), 가운데에 리포트 읽는 법
 * 네 줄, 오른쪽에 워드마크와 발행 정보.
 */
const TIPS: { tone: string; text: string }[] = [
  { tone: '--ig-teal', text: '색은 난도입니다. 청록(쉬움)에서 코랄(매우 어려움)로 갈수록 어렵습니다.' },
  { tone: '--ig-sand', text: '격자의 칸 하나, 점 하나가 문항 하나입니다. 번호는 시험지 번호와 같습니다.' },
  { tone: '--ig-coral', text: '사람 그림과 파이가 찬 만큼이 전체 문항 중 비율입니다.' },
  { tone: '--ig-navy', text: '큰 숫자는 모두 이 시험의 실제 문항 수·배점입니다.' },
];

const ReportFooter: React.FC<{
  stats: ReportStats;
  passageCount?: number;
  date?: string;
  teacher?: string;
  className?: string;
}> = ({ stats, passageCount = 0, date, teacher, className = '' }) => {
  const parsed = date ? new Date(date) : null;
  const issued = parsed && !isNaN(parsed.getTime())
    ? `${parsed.getFullYear()}.${String(parsed.getMonth() + 1).padStart(2, '0')}.${String(parsed.getDate()).padStart(2, '0')}`
    : null;

  const tiles: { icon: React.ReactNode; tone: string; label: string; value: string }[] = [
    { icon: <CheckSquare className="w-5 h-5" />, tone: TYPE_TONE.objective, label: '객관식', value: `${stats.objective}문항` },
    { icon: <PenLine className="w-5 h-5" />, tone: TYPE_TONE.subjective, label: '서답형', value: `${stats.subjective}문항` },
  ];
  if (!stats.fromForm) tiles.push({ icon: <Flame className="w-5 h-5" />, tone: '--ig-coral', label: '최고난도', value: `${stats.killer}문항` });
  if (passageCount > 0) tiles.push({ icon: <GitCompare className="w-5 h-5" />, tone: '--ig-slate', label: '원문 대조', value: `${passageCount}건` });
  if (stats.hasIsVariant && stats.variant > 0) tiles.push({ icon: <Shuffle className="w-5 h-5" />, tone: '--ig-teal', label: '변형 지문', value: `${stats.variant}문항` });

  return (
    <footer className={`ig-module ig-module-tight ${className}`}>
      <div className="flex flex-col gap-6 md:flex-row print:flex-row md:items-start print:items-start">
        <div className="min-w-0 md:w-[42%] print:w-[42%]">
          <span className="ig-col-l" style={{ marginTop: 0 }}>Legend · 기호 설명</span>
          <div className="mt-3 grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))' }}>
            {tiles.map((t) => (
              <IgIconTile key={t.label} icon={t.icon} tone={t.tone} label={t.label} value={t.value} size={44} />
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5">
            {DIFFICULTIES.map((d) => (
              <span key={d} className="ig-leg">
                <span aria-hidden className="ig-print-color" style={{ width: 9, height: 9, background: `hsl(var(${DIFF_TONE[d]}))`, transform: 'rotate(45deg)', display: 'inline-block' }} />
                <span className="ig-leg-l">{DIFF_LABEL[d]}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <span className="ig-col-l" style={{ marginTop: 0 }}>How to read · 읽는 법</span>
          <ul className="mt-3 space-y-2">
            {TIPS.map((t, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[11.5px] leading-[1.65] text-[hsl(var(--ink))]" style={{ wordBreak: 'keep-all' }}>
                <span aria-hidden className="ig-print-color mt-[6px] inline-block flex-none" style={{ width: 7, height: 7, transform: 'rotate(45deg)', background: `hsl(var(${t.tone}))` }} />
                <span>{t.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-none items-center gap-3 md:flex-col print:flex-col md:items-end print:items-end">
          <span className="flex items-center gap-2">
            <img src="/lovable-uploads/e5fb85df-a5db-42ec-86c2-dbf7a0e67ff7.png" alt="" className="h-7 w-7 object-contain" />
            <span className="ig-condensed text-[18px] font-bold tracking-[0.08em] text-[hsl(var(--ink))]">ORUN ENGLISH</span>
          </span>
          <span className="ig-stat-c" style={{ marginTop: 0, whiteSpace: 'normal', textAlign: 'right' }}>
            © {new Date().getFullYear()} ORUN ENGLISH{issued ? ` · 발행 ${issued}` : ''}{teacher ? ` · 담당 ${teacher}` : ''}
          </span>
        </div>
      </div>
    </footer>
  );
};

export default ReportFooter;
