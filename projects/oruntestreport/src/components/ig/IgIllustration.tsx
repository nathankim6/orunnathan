import React from 'react';

export type IllustrationKind = 'profile' | 'growth' | 'roadmap' | 'answers' | 'feedback' | 'reading';

/**
 * 납작한 벡터 일러스트 타일.
 *
 * public/images/design 의 그림(남색 바탕 위 코랄·청록·노랑 픽토그램)을 작은
 * 사각 타일로 놓는다. 그림은 448px webp 로 줄여 두었다 — 원본 1024px png 는
 * 한 장에 1MB 라 PDF 캡처가 무거워진다. 장식이므로 alt 는 비운다.
 */
const IgIllustration: React.FC<{ kind: IllustrationKind; size?: number; className?: string; style?: React.CSSProperties }> = ({
  kind, size = 120, className = '', style,
}) => (
  <img
    src={`/images/design/${kind}-s.webp`}
    alt=""
    aria-hidden="true"
    width={size}
    height={size}
    decoding="sync"
    loading="eager"
    className={`ig-print-color ${className}`}
    style={{ width: size, height: size, objectFit: 'cover', display: 'block', flex: 'none', borderRadius: 2, ...style }}
  />
);

export default IgIllustration;
