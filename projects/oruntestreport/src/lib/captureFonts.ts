import { getFontEmbedCSS } from 'html-to-image';

/**
 * 캡처 전에 서체가 다 내려와 있어야 한다.
 *
 * html-to-image 는 문서의 @font-face 를 찾아 파일을 박아 넣는데, 아직 안 내려온
 * 서체는 시스템 서체로 찍힌다. 그러면 Oswald 숫자가 넓어져 칸이 줄바꿈된다.
 * fonts.ready 만으로는 "쓰인 적 없는" 굵기는 안 내려오므로 필요한 것을 콕 집어
 * 불러 둔다.
 */
export async function waitForFonts(): Promise<void> {
  const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
  if (!fonts) return;
  try { await fonts.ready; } catch { /* 없어도 진행 */ }
  const wants = [
    "700 12px Oswald", "600 12px Oswald", "500 12px Oswald",
    "900 12px 'Noto Sans KR'", "700 12px 'Noto Sans KR'", "400 12px 'Noto Sans KR'",
  ];
  await Promise.all(wants.map((w) => fonts.load(w, '가0').catch(() => undefined)));
}

/**
 * 서체 임베드 CSS 는 만드는 데 시간이 걸린다(모든 @font-face 의 파일을 받아
 * data URL 로 바꾼다). 한 번 만든 것을 모듈 안에 두고 다시 쓴다. 리포트 PDF 와
 * 학생 제출 이미지가 같은 것을 나눠 쓴다.
 */
let cache: string | null = null;
export async function getReportFontCss(el: HTMLElement): Promise<string> {
  if (cache) return cache;
  cache = await getFontEmbedCSS(el);
  return cache;
}

/** 캡처 직전 두 프레임 기다린다 — 폭·테마를 바꾼 뒤 재배치가 끝나야 한다. */
export const nextFrames = (n = 2) =>
  new Promise<void>((resolve) => {
    const step = (k: number) => (k <= 0 ? resolve() : requestAnimationFrame(() => step(k - 1)));
    step(n);
  });
