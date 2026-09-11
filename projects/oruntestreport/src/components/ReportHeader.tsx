import React from 'react';
import { getSchoolLogo } from '@/lib/schoolLogos';
import { useLogoBannerTheme } from '@/lib/logoColor';
import IgHead from '@/components/ig/IgHead';

interface ReportHeaderProps {
  date: string;
  themeColors: any;
  schoolName?: string;
}

/**
 * 리포트 표제.
 *
 * 레퍼런스의 신문 제호 어법을 따른다. 위에 발행 정보를 한 줄로 얇게 깔고,
 * 가는 선을 하나 그은 뒤, 아래에 굵은 제목과 오른쪽 회색 보조어를 놓는다.
 * 학교 색은 왼쪽 가는 띠 하나로만 남긴다. 면을 칠하면 보고서가 아니라
 * 발표 자료처럼 보인다.
 */
const ReportHeader: React.FC<ReportHeaderProps> = ({ date, schoolName }) => {
  const parsed = date ? new Date(date) : new Date();
  const issueDate = isNaN(parsed.getTime()) ? new Date() : parsed;
  const issued = `${issueDate.getFullYear()}. ${String(issueDate.getMonth() + 1).padStart(2, '0')}. ${String(
    issueDate.getDate(),
  ).padStart(2, '0')}`;

  const schoolLogo = getSchoolLogo(schoolName);
  const banner = useLogoBannerTheme(schoolLogo);
  const [logoOk, setLogoOk] = React.useState(true);

  return (
    <header className="ig-module relative overflow-hidden">
      <span
        aria-hidden
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{ background: `linear-gradient(180deg, ${banner.from}, ${banner.mid})` }}
      />

      {/* 발행 정보 */}
      <div className="flex items-center gap-3 md:gap-4 pl-1.5">
        <img
          src="/lovable-uploads/orun-logo-new.png"
          alt="ORUN ACADEMY"
          className="h-8 w-8 md:h-9 md:w-9 shrink-0 object-contain"
        />
        <span className="ig-stat-c" style={{ marginTop: 0 }}>
          ORUN ENGLISH
        </span>

        <span className="ml-auto flex items-center gap-3 md:gap-4">
          {schoolLogo && logoOk && (
            <img
              src={schoolLogo}
              alt={`${schoolName ?? ''} 로고`}
              onError={() => setLogoOk(false)}
              className="hidden sm:block h-8 md:h-9 w-auto max-w-[112px] shrink-0 object-contain"
            />
          )}
          <span className="ig-stat-c" style={{ marginTop: 0 }}>
            ISSUED&nbsp;&nbsp;{issued}
          </span>
        </span>
      </div>

      <div className="ig-rule-soft" />

      <IgHead
        className="mt-5 pl-1.5"
        title="내신시험 분석 리포트"
        title2={schoolName}
        sub={['EXAM', 'ANALYSIS']}
      />
    </header>
  );
};

export default ReportHeader;
