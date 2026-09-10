import React from 'react';
import FxStage from '@/components/FxStage';
import { getSchoolLogo } from '@/lib/schoolLogos';
import { useLogoBannerTheme } from '@/lib/logoColor';

interface ReportHeaderProps {
  date: string;
  themeColors: any;
  schoolName?: string;
}

/**
 * 리포트 표제 — 예전에는 화면 가득한 남색 그라데이션 띠였다.
 * 색을 크게 쓰면 눈에는 먼저 들어오지만 학원 인쇄물보다 발표 자료처럼 보인다.
 * 흰 면에 학교 색을 가는 선으로만 남겨 두면 오히려 정돈되어 보인다.
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
    <header className="rp-card rp-card-tight overflow-hidden">
      {/* 학교 색은 왼쪽 가는 띠 하나로만 — 면을 칠하지 않는다 */}
      <span
        aria-hidden
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{ background: `linear-gradient(180deg, ${banner.from}, ${banner.mid})` }}
      />

      <div className="flex items-center gap-4 md:gap-5 pl-2">
        <img
          src="/lovable-uploads/orun-logo-new.png"
          alt="ORUN ACADEMY"
          className="h-11 w-11 md:h-12 md:w-12 shrink-0 rounded-[10px] object-contain"
        />

        <span aria-hidden className="h-9 w-px shrink-0 bg-[hsl(var(--ink)/0.10)]" />

        <div className="min-w-0 flex-1">
          <p className="rp-label" style={{ color: banner.mid }}>
            ORUN ENGLISH
          </p>
          <h1 className="mt-1.5 font-display text-[18px] sm:text-[22px] md:text-[26px] font-semibold leading-none tracking-[-0.03em] text-[hsl(var(--ink))]">
            내신시험 분석 리포트
          </h1>
        </div>

        {schoolLogo && logoOk && (
          <img
            src={schoolLogo}
            alt={`${schoolName ?? ''} 로고`}
            onError={() => setLogoOk(false)}
            className="hidden sm:block h-10 md:h-12 w-auto max-w-[130px] shrink-0 object-contain"
          />
        )}

        <div className="shrink-0 text-right">
          <p className="rp-label">ISSUED</p>
          <p
            className="mt-1.5 text-[12px] md:text-[13px] font-semibold leading-none text-[hsl(var(--ink))]"
            style={{ fontFeatureSettings: "'tnum' 1" }}
          >
            {issued}
          </p>
        </div>
      </div>

      {/* 표제 아래 빛 띠 — 화면에서만 흐른다 */}
      <FxStage
        kind="sweep"
        options={{ tone: banner.accent, gain: 1.15 }}
        height={40}
        label="EXAM ANALYSIS"
        readout={schoolName || 'ORUN ENGLISH'}
        className="mt-4"
      />
    </header>
  );
};

export default ReportHeader;
