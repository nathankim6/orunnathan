import React, { useEffect, useState } from 'react';

/**
 * QR 코드 — 학생 제출 링크처럼 손으로 치기 힘든 주소용.
 *
 * qrcode 를 필요할 때만 불러온다(리포트 첫 그림에 끼어들 이유가 없다). 결과
 * SVG 에는 width·height 를 넣고(뷰박스만 있으면 캡처가 부풀린다), 색은 currentColor
 * 로 바꿔 잉크 토큰을 따르게 한다.
 */
const IgQr: React.FC<{ text: string; size?: number; className?: string }> = ({ text, size = 88, className = '' }) => {
  const [svg, setSvg] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    import('qrcode')
      .then((m) => m.toString(text, { type: 'svg', margin: 0, width: size, errorCorrectionLevel: 'M', color: { dark: '#000000ff', light: '#0000' } }))
      .then((s) => { if (alive) setSvg(s.replace(/#000000(ff)?/gi, 'currentColor')); })
      .catch(() => { if (alive) setSvg(null); });
    return () => { alive = false; };
  }, [text, size]);
  return (
    <span
      className={`ig-print-color ${className}`}
      style={{ width: size + 8, height: size + 8, padding: 4, boxSizing: 'border-box', display: 'block', flex: 'none', color: 'hsl(var(--ig-qr-ink))', background: 'hsl(var(--ig-qr-bg))' }}
      role="img"
      aria-label={`QR: ${text}`}
      dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
    />
  );
};

export default IgQr;
