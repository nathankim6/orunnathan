import React from 'react';
import { School, GraduationCap, ClipboardList, UserRound, BookOpenText } from 'lucide-react';
import { getSchoolLogo } from '@/lib/schoolLogos';
import { useLogoBannerTheme } from '@/lib/logoColor';
import IgHead from '@/components/ig/IgHead';
import IgDotMatrix from '@/components/ig/IgDotMatrix';
import type { ReportStats, Problem } from '@/lib/reportStats';

interface ReportHeaderProps {
  date: string;
  schoolName?: string;
  grade?: string;
  examInfo?: string;
  teacher?: string;
  examScope?: string;
  stats: ReportStats;
  problems?: Problem[];
  className?: string;
}

/**
 * 리포트 제호 — 기본정보까지 한 모듈에 담는다.
 *
 * 레퍼런스의 신문 제호 어법이다. 위에 눈썹줄(로고·학원·학교 / 발행일), 굵은
 * 제목 두 줄과 그 옆 흐린 거대 숫자(문항 수), 오른쪽에 영문 보조어와 점
 * 매트릭스(문항 하나가 점 하나), 굵은 괘선. 괘선 아래에 아이콘 4열 기본정보와
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
  date, schoolName, grade, examInfo, teacher, examScope, stats, problems, className = '',
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

      <IgHead
        className="mt-5 pl-1.5"
        title="내신시험 분석 리포트"
        title2={subtitle || undefined}
        big={stats.total > 0 ? stats.total : undefined}
        bigUnit="문항"
        sub={['EXAM', 'ANALYSIS', 'REPORT']}
        aside={<span className="hidden md:block print:block"><IgDotMatrix problems={problems} /></span>}
      />

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
