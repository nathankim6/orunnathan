import React from 'react';

/**
 * 섹션 머리.
 *
 * 예전에는 섹션마다 생김새가 달랐다. 어떤 곳은 회색으로 꽉 채운 띠에 로마
 * 숫자 배지를, 어떤 곳은 배지 없이 큰 제목만 썼다. 종류가 많으면 화려한 게
 * 아니라 산만해진다. 작은 키커 · 제목 · 남는 자리를 채우는 가는 선,
 * 이 셋으로만 통일한다.
 */
const ReportSectionHead: React.FC<{
  /** 위에 작게 얹는 영문 구분 (예: OVERVIEW) */
  kicker: string;
  title: string;
  /** 팔레트 토큰 이름 (예: '--c2') */
  tone?: string;
  className?: string;
}> = ({ kicker, title, tone = '--gold', className = '' }) => (
  <div className={`rp-section-head ${className}`} style={{ ['--sec' as never]: `var(${tone})` }}>
    <span className="rp-section-kicker">{kicker}</span>
    <h2 className="rp-section-title pdf-capture-nowrap">{title}</h2>
    <span aria-hidden className="rp-rule" />
  </div>
);

export default ReportSectionHead;
