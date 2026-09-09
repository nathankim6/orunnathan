import React from 'react';
import { School, GraduationCap, ClipboardList, UserRound, BookOpenText } from 'lucide-react';

interface ReportInfoCardsProps {
  reportData: {
    school: string;
    grade: string;
    examScope: string;
    teacher: string;
    examInfo?: string;
  };
  themeColors: any;
}

/**
 * 시험 기본 정보 — 예전에는 학교 로고가 담긴 커다란 빈 상자 하나와
 * 크기가 제각각인 카드들이 섞여 있어 시선이 어디에 머물지 알 수 없었다.
 * 같은 크기의 카드를 같은 간격으로 늘어놓으면 그것만으로 정돈되어 보인다.
 * (학교 로고는 맨 위 표제로 옮겼다.)
 */
const InfoCard: React.FC<{
  label: string;
  icon: React.ReactNode;
  tone: string;
  value: string;
  /** 글자가 길면 한 단계 작게 — 카드 높이는 그대로 두려고 */
  size?: 'lg' | 'md' | 'sm';
  className?: string;
}> = ({ label, icon, tone, value, size = 'lg', className = '' }) => (
  <div className={`rp-card rp-card-tight ${className}`} style={{ ['--tone' as never]: `var(${tone})` }}>
    <div className="rp-head">
      <span className="rp-glyph">{icon}</span>
      <span className="rp-label">{label}</span>
    </div>
    <p
      className={`rp-value mt-3.5 ${
        size === 'lg' ? 'text-[19px] md:text-[22px]' : size === 'md' ? 'text-[16px] md:text-[18px]' : 'text-[14px] md:text-[15px]'
      }`}
    >
      {value}
    </p>
  </div>
);

/** 글자 수에 따라 값의 크기를 한 단계씩 낮춘다. */
const sizeFor = (text: string): 'lg' | 'md' | 'sm' => {
  const len = (text || '').length;
  if (len <= 5) return 'lg';
  if (len <= 11) return 'md';
  return 'sm';
};

const ReportInfoCards: React.FC<ReportInfoCardsProps> = ({ reportData }) => {
  const examInfo = reportData.examInfo || '미지정';

  return (
    <section className="report-section">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <InfoCard
          label="학교"
          tone="--c1"
          icon={<School size={14} strokeWidth={2.1} />}
          value={reportData.school}
          size={sizeFor(reportData.school)}
        />
        <InfoCard
          label="학년"
          tone="--c2"
          icon={<GraduationCap size={14} strokeWidth={2.1} />}
          value={reportData.grade}
          size={sizeFor(reportData.grade)}
        />
        <InfoCard
          label="시험"
          tone="--c4"
          icon={<ClipboardList size={14} strokeWidth={2.1} />}
          value={examInfo}
          size={sizeFor(examInfo)}
        />
        <InfoCard
          label="담당 강사"
          tone="--c5"
          icon={<UserRound size={14} strokeWidth={2.1} />}
          value={reportData.teacher}
          size={sizeFor(reportData.teacher)}
        />
      </div>

      {/* 시험 범위는 문장에 가까우므로 한 줄을 통째로 준다 */}
      <div className="rp-card rp-card-tight mt-3 md:mt-4" style={{ ['--tone' as never]: 'var(--c3)' }}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
          <div className="rp-head shrink-0">
            <span className="rp-glyph">
              <BookOpenText size={14} strokeWidth={2.1} />
            </span>
            <span className="rp-label">시험 범위</span>
          </div>
          <p className="rp-value rp-prose text-[15px] md:text-[17px] sm:border-l sm:border-[hsl(var(--ink)/0.08)] sm:pl-5">
            {reportData.examScope}
          </p>
        </div>
      </div>
    </section>
  );
};

export default ReportInfoCards;
