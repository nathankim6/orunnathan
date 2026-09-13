import React from 'react';

export type IllustrationKind = 'profile' | 'growth' | 'roadmap' | 'answers' | 'feedback' | 'reading';

/**
 * 납작한 벡터 일러스트 타일.
 *
 * public/images/design 의 그림(남색 바탕 위 코랄·청록·노랑 픽토그램)을 작은
 * 사각 타일로 놓는다. 448px webp 를 먼저 찾고, 없으면 원본 1024px png 로
 * 떨어진다(원본은 한 장에 1MB 라 첫 로딩만 느려질 뿐 PDF 크기와는 무관하다 —
 * 캡처는 화면 픽셀을 다시 찍는다). 장식이므로 alt 는 비운다.
 */
const IgIllustration: React.FC<{ kind: IllustrationKind; size?: number; className?: string; style?: React.CSSProperties }> = ({
  kind, size = 120, className = '', style,
}) => {
  const [src, setSrc] = React.useState(`/images/design/${kind}-s.webp`);
  const fallback = `/images/design/infographic-${kind}.png`;
  return (
    <img
      src={src}
      onError={() => { if (src !== fallback) setSrc(fallback); }}
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
};

export default IgIllustration;
