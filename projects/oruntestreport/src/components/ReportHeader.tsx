import React from 'react';
import { School, GraduationCap, ClipboardList, UserRound, BookOpenText } from 'lucide-react';
import { getSchoolLogo } from '@/lib/schoolLogos';
import { useLogoBannerTheme } from '@/lib/logoColor';
import IgHead from '@/components/ig/IgHead';
import IgSwatchStrip from '@/components/ig/IgSwatchStrip';
import IgIllustration from '@/components/ig/IgIllustration';
import { DIFFICULTIES, DIFF_LABEL_EN, DIFF_TONE, TYPE_TONE, type ReportStats } from '@/lib/reportStats';

interface ReportHeaderProps {
  date: string;
  schoolName?: string;
  grade?: string;
  examInfo?: string;
  teacher?: string;
  examScope?: string;
  stats: ReportStats;
  className?: string;
}

/**
 * 제호 — 레퍼런스 "INFOGRAPHIC TOOLS 2" 의 첫 모듈.
 *
 * 눈썹줄(로고·학원·학교 / 발행일), 굵은 제목과 그 옆 흐린 거대 숫자(문항 수),
 * 오른쪽 영문 보조어, 굵은 괘선. 괘선 아래에 색 견본 띠(이 리포트의 색 약속)와
 * 한 문단 요약, 오른쪽에 납작한 일러스트 타일. 그 아래 아이콘 4열 기본정보와
 * 시험 범위 칩. 학교 색은 왼쪽 가는 띠 하나로만.
 */
const Field: React.FC<{ icon: React.ReactNode; label: string; value: string; tone: string }> = ({ icon, label, value, tone }) => (
  <div className="min-w-0 px-3 first:pl-0 last:pr-0">
    <span className="block" style={{ color: `hsl(var(${tone}))` }}>{icon}</span>
    <span className="ig-col-l block">{label}</span>
    <p className="mt-1 font-display text-[15px] font-bold leading-snug text-[hsl(var(--ink))]" style={{ wordBreak: 'keep-all' }}>
      {value || '—'}
    </p>
  </div>
);

const ReportHeader: React.FC<ReportHeaderProps> = ({
  date, schoolName, grade, examInfo, teacher, examScope, stats, className = '',
}) => {
  const parsed = date ? new Date(date) : null;
  const issued = parsed && !isNaN(parsed.getTime())
    ? `${parsed.getFullYear()}. ${String(parsed.getMonth() + 1).padStart(2, '0')}. ${String(parsed.getDate()).padStart(2, '0')}`
    : null;

  const schoolLogo = getSchoolLogo(schoolName);
  const banner = useLogoBannerTheme(schoolLogo);
  const [logoOk, setLogoOk] = React.useState(true);
  const scopeChips = (examScope || '').split(/\s*[·,/]\s*/).map((s) => s.trim()).filter(Boolean);
  const subtitle = [grade, examInfo].filter(Boolean).join(' · ');

  const lede = stats.total > 0
    ? `${[schoolName, grade, examInfo].filter(Boolean).join(' ')} 영어 시험 ${stats.total}문항을 유형·난도·문항별로 분석했습니다. `
      + `객관식 ${stats.objective}문항, 서답형 ${stats.subjective}문항`
      + (stats.fromForm ? '입니다.' : `이며, 최고난도 문항은 ${stats.killer}문항입니다.`)
    : undefined;

  const swatches = [
    ...DIFFICULTIES.map((d) => ({ tone: DIFF_TONE[d], label: DIFF_LABEL_EN[d] })),
    { tone: TYPE_TONE.objective, label: 'OBJECTIVE' },
    { tone: TYPE_TONE.subjective, label: 'WRITTEN' },
  ];

  return (
    <header className={`ig-module ${className}`} style={{ paddingTop: 22 }}>
      <span aria-hidden className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: banner.mid }} />

      {/* 눈썹줄 */}
      <div className="flex items-center gap-3 pl-1.5">
        <img src="/lovable-uploads/orun-logo-new.png" alt="ORUN ACADEMY" className="h-7 w-7 shrink-0 object-contain" />
        <span className="ig-col-l" style={{ marginTop: 0 }}>
          ORUN ENGLISH{schoolName ? ` · ${schoolName}` : ''}
        </span>
        <span className="ml-auto flex items-center gap-3">
          {schoolLogo && logoOk && (
            <img src={schoolLogo} alt={`${schoolName ?? ''} 로고`} onError={() => setLogoOk(false)}
                 className="hidden sm:block h-7 w-auto max-w-[100px] shrink-0 object-contain" />
          )}
          {issued && <span className="ig-col-l" style={{ marginTop: 0 }}>Issued&nbsp;{issued}</span>}
        </span>
      </div>
      <div className="ig-rule-soft" />

      <div className="mt-5 pl-1.5 flex flex-col sm:flex-row print:flex-row gap-5 sm:items-start print:items-start">
        <div className="min-w-0 flex-1">
          <IgHead
            title="내신시험 분석 리포트"
            title2={subtitle || undefined}
            big={stats.total > 0 ? stats.total : undefined}
            bigUnit="문항"
            sub={['EXAM', 'ANALYSIS', 'REPORT']}
          />
          <IgSwatchStrip className="mt-4" items={swatches} />
          {lede && <p className="ig-lede" style={{ maxWidth: '48em' }}>{lede}</p>}
        </div>
        <IgIllustration kind="profile" size={150} className="hidden sm:block print:block" />
      </div>

      {/* 기본정보 */}
      <div className="mt-5 pl-1.5 grid grid-cols-2 md:grid-cols-4 print:grid-cols-4 gap-y-5 divide-x divide-[hsl(var(--ink)/0.1)]">
        <Field icon={<School className="w-6 h-6" strokeWidth={1.75} />} label="School" value={schoolName || ''} tone="--ig-navy" />
        <Field icon={<GraduationCap className="w-6 h-6" strokeWidth={1.75} />} label="Grade" value={grade || ''} tone="--ig-teal" />
        <Field icon={<ClipboardList className="w-6 h-6" strokeWidth={1.75} />} label="Exam" value={examInfo || ''} tone="--ig-coral" />
        <Field icon={<UserRound className="w-6 h-6" strokeWidth={1.75} />} label="Teacher" value={teacher || ''} tone="--ig-sand" />
      </div>

      {scopeChips.length > 0 && (
        <div className="mt-4 pl-1.5 flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 mr-1">
            <BookOpenText className="w-4 h-4 text-[hsl(var(--ig-slate))]" strokeWidth={1.75} />
            <span className="ig-col-l" style={{ marginTop: 0 }}>Exam scope</span>
          </span>
          {scopeChips.map((c, i) => (
            <span key={i} className="ig-chip ig-chip-ghost" style={{ textTransform: 'none', letterSpacing: 0, fontSize: 11 }}>{c}</span>
          ))}
        </div>
      )}
    </header>
  );
};

export default ReportHeader;
