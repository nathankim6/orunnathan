/**
 * 리포트를 화면에 보이는 그대로 이미지로 저장하기 위한 공용 캡처 모듈.
 *
 * 왜 html2canvas 를 쓰지 않는가
 * ------------------------------
 * html2canvas 는 브라우저의 레이아웃을 쓰지 않고 CSS 를 자체적으로 다시 계산해
 * 캔버스에 직접 글자를 그린다. 이 과정에서 한글의 줄 상자 높이(ascent/descent)를
 * 브라우저와 다르게 잡기 때문에, 글자가 제자리보다 아래로 밀리고 카드처럼
 * overflow-hidden 이 걸린 영역에서 받침이 잘려 나간다.
 * (실제 리포트에서 "장현성3105" → "자현서3105", "고등부" → "그드브" 로 잘림)
 *
 * html-to-image 는 대상 DOM 을 SVG foreignObject 안에 넣어 브라우저가 직접
 * 레이아웃·렌더링하게 하므로 화면과 위치가 같다. 같은 리포트로 비교했을 때
 * 화면 대비 차이가 html2canvas 4.8% → html-to-image 1.4% 로 줄었고,
 * 남은 차이는 1px 미만의 미세한 위치 차이뿐이다.
 */
import { toCanvas } from 'html-to-image';

/** 브라우저별 캔버스 한계. 넘으면 빈 이미지가 나오거나 예외가 난다. */
const MAX_CANVAS_DIM = 16384;
/** iOS Safari 의 캔버스 총 픽셀 한계(가장 빡빡한 기준에 맞춘다). */
const MAX_CANVAS_AREA = 16_777_216;

/** 캔버스 한계 안으로 들어오는 최대 배율. */
const fitPixelRatio = (width: number, height: number, requested: number): number => {
  if (!width || !height) return 1;
  const byWidth = MAX_CANVAS_DIM / width;
  const byHeight = MAX_CANVAS_DIM / height;
  const byArea = Math.sqrt(MAX_CANVAS_AREA / (width * height));
  return Math.max(1, Math.min(requested, byWidth, byHeight, byArea));
};

/** 캡처 전에 폰트와 이미지가 모두 준비될 때까지 기다린다. */
const waitForAssets = async (element: HTMLElement): Promise<void> => {
  try {
    await document.fonts.ready;
  } catch {
    /* 폰트 API 가 없으면 그냥 진행 */
  }
  const images = Array.from(element.querySelectorAll('img'));
  await Promise.all(
    images.map((img) => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise<void>((resolve) => {
        const done = () => resolve();
        img.addEventListener('load', done, { once: true });
        img.addEventListener('error', done, { once: true });
        // 이미지가 끝내 오지 않아도 저장은 진행한다
        setTimeout(done, 5000);
      });
    })
  );
  // 차트(recharts)와 애니메이션이 최종 상태로 자리를 잡을 시간
  await new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 300)));
};

export interface CaptureOptions {
  /** 원하는 확대 배율. 캔버스 한계를 넘으면 자동으로 낮춘다. 기본 2. */
  pixelRatio?: number;
  backgroundColor?: string;
}

/**
 * 리포트 요소를 화면에 보이는 그대로 캔버스에 담는다.
 * data-export-ignore 가 붙은 요소만 제외한다(자리도 함께 빠지므로 남용 금지).
 */
export const captureReportCanvas = async (
  element: HTMLElement,
  options: CaptureOptions = {}
): Promise<HTMLCanvasElement> => {
  await waitForAssets(element);

  const width = element.scrollWidth || element.offsetWidth;
  const height = element.scrollHeight || element.offsetHeight;
  const pixelRatio = fitPixelRatio(width, height, options.pixelRatio ?? 2);
  return toCanvas(element, {
    backgroundColor: options.backgroundColor ?? '#ffffff',
    pixelRatio,
    // 폰트는 라이브러리 기본 처리에 맡긴다. getFontEmbedCSS 로 미리 만들어
    // 넘기면(성능 목적) 그 호출 자체가 모든 굵기의 한글 웹폰트를 새로 불러오면서
    // 페이지 레이아웃을 흔들어, 저장된 이미지의 가로폭과 줄바꿈이 화면과 달라졌다.
    // cacheBust 는 폰트·이미지 URL 에 쿼리를 붙여 CORS 캐시를 깨고 임베딩을
    // 실패시킬 수 있어 쓰지 않는다.
    cacheBust: false,
    filter: (node) => !(node instanceof HTMLElement && node.hasAttribute('data-export-ignore')),
  });
};

/** 리포트를 JPEG Blob 으로 저장한다. */
export const captureReportBlob = async (
  element: HTMLElement,
  options: CaptureOptions & { quality?: number } = {}
): Promise<Blob> => {
  const canvas = await captureReportCanvas(element, options);
  if (!canvas.width || !canvas.height) {
    throw new Error('Generated canvas has zero dimensions');
  }
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Failed to create blob'))),
      'image/jpeg',
      options.quality ?? 0.95
    );
  });
};

/** Blob 을 파일로 내려받는다. */
export const saveBlobAsFile = (blob: Blob, fileName: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/** 리포트를 이미지 파일로 바로 저장한다. */
export const downloadReportImage = async (
  element: HTMLElement,
  fileName: string,
  options: CaptureOptions & { quality?: number } = {}
): Promise<void> => {
  const blob = await captureReportBlob(element, options);
  saveBlobAsFile(blob, fileName.endsWith('.jpg') ? fileName : `${fileName}.jpg`);
};
