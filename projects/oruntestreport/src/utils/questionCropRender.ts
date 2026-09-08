/**
 * questionCrop.ts 가 계산한 "조각 목록"을 실제 그림 한 장으로 합성한다.
 *
 * 하는 일
 * -------
 * 1. 조각마다 해당 페이지 캔버스에서 그 영역을 떼어낸다.
 * 2. 조각의 위/아래 빈 여백을 실제 글자 위치까지 깎는다(잉크 프로파일).
 *    단이 바뀌는 지점은 "단 끝까지"로 잡히기 때문에, 깎지 않으면 아래쪽에
 *    빈 공간이 길게 남는다.
 * 3. 조각들의 좌우 빈 여백도 깎아 문제만 남긴다.
 * 4. 폭을 맞춰 세로로 이어 붙인다.
 *
 * 결과적으로 단이나 페이지를 넘어가는 문항도 "그 문제만" 담긴 한 장이 된다.
 */
import type { CropSegment } from './questionCrop';

/** 이 값보다 어두우면 글자로 친다(0~255). */
const INK_THRESHOLD = 205;
/** 한 줄(또는 한 열)에 글자 픽셀이 이만큼은 있어야 내용으로 친다. */
const MIN_INK_RATIO = 0.002;
/** 잘라낸 내용 둘레에 남기는 여백(px) */
const PADDING = 10;
/** 조각 사이 간격(px) */
const SEGMENT_GAP = 14;
/** 픽셀을 훑을 때의 간격 — 정확도를 크게 해치지 않으면서 빠르게 */
const SAMPLE_STEP = 2;
/** 합성 결과의 최대 폭·높이(너무 큰 캔버스는 브라우저가 못 만든다) */
const MAX_OUTPUT_DIM = 4000;

interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** 캔버스에서 잘라낼 영역(픽셀)을 조각 좌표(0~1)로부터 계산 */
const toPixelBox = (canvas: HTMLCanvasElement, seg: CropSegment): Box => {
  const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
  const x0 = clamp01(Math.min(seg.xStart, seg.xEnd));
  const x1 = clamp01(Math.max(seg.xStart, seg.xEnd));
  const y0 = clamp01(Math.min(seg.yStart, seg.yEnd));
  const y1 = clamp01(Math.max(seg.yStart, seg.yEnd));
  const left = Math.floor(canvas.width * x0);
  const top = Math.floor(canvas.height * y0);
  return {
    left,
    top,
    width: Math.max(1, Math.floor(canvas.width * (x1 - x0))),
    height: Math.max(1, Math.floor(canvas.height * (y1 - y0))),
  };
};

/**
 * 잘라낸 영역에서 실제로 글자가 있는 범위를 찾는다.
 * 반환값은 box 기준의 상대 좌표. 글자가 하나도 없으면 null.
 */
const findInkBounds = (ctx: CanvasRenderingContext2D, box: Box): Box | null => {
  let data: Uint8ClampedArray;
  try {
    data = ctx.getImageData(box.left, box.top, box.width, box.height).data;
  } catch {
    // 캔버스가 오염된 경우(교차 출처 이미지) 등 — 깎지 않고 그대로 쓴다.
    return { left: 0, top: 0, width: box.width, height: box.height };
  }

  const rowMin = Math.max(1, Math.floor((box.width / SAMPLE_STEP) * MIN_INK_RATIO));
  const colMin = Math.max(1, Math.floor((box.height / SAMPLE_STEP) * MIN_INK_RATIO));
  const rowInk = new Uint32Array(box.height);
  const colInk = new Uint32Array(box.width);

  for (let y = 0; y < box.height; y += SAMPLE_STEP) {
    const rowStart = y * box.width * 4;
    for (let x = 0; x < box.width; x += SAMPLE_STEP) {
      const i = rowStart + x * 4;
      // 밝기(빠른 근사) — 알파가 0이면 배경으로 본다.
      const a = data[i + 3];
      if (a === 0) continue;
      const lum = (data[i] * 299 + data[i + 1] * 587 + data[i + 2] * 114) / 1000;
      if (lum < INK_THRESHOLD) {
        rowInk[y] += 1;
        colInk[x] += 1;
      }
    }
  }

  let top = -1;
  let bottom = -1;
  for (let y = 0; y < box.height; y += SAMPLE_STEP) {
    if (rowInk[y] >= rowMin) {
      if (top < 0) top = y;
      bottom = y;
    }
  }
  if (top < 0) return null;

  let left = -1;
  let right = -1;
  for (let x = 0; x < box.width; x += SAMPLE_STEP) {
    if (colInk[x] >= colMin) {
      if (left < 0) left = x;
      right = x;
    }
  }
  if (left < 0) {
    left = 0;
    right = box.width - 1;
  }

  return {
    left: Math.max(0, left - PADDING),
    top: Math.max(0, top - PADDING),
    width: Math.min(box.width, right - left + 1 + PADDING * 2),
    height: Math.min(box.height, bottom - top + 1 + PADDING * 2),
  };
};

export interface RenderOptions {
  /** 결과 이미지 품질(0~1) */
  quality?: number;
  /** 빈 여백 깎기를 끄고 싶을 때 */
  trim?: boolean;
}

interface Piece {
  canvas: HTMLCanvasElement;
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

/**
 * 조각들을 세로로 이어 붙여 한 장의 JPEG dataURL 로 만든다.
 * 조각이 하나뿐이면 그냥 그 영역만 잘라낸 것과 같다.
 *
 * @param segments     questionCrop.buildSegments 가 만든 조각 목록
 * @param pageCanvases 1페이지부터 순서대로 렌더된 페이지 캔버스
 */
export const renderSegments = (
  segments: CropSegment[],
  pageCanvases: HTMLCanvasElement[],
  options: RenderOptions = {},
): string => {
  const trim = options.trim !== false;
  const pieces: Piece[] = [];

  segments.forEach((seg) => {
    const canvas = pageCanvases[seg.page - 1];
    if (!canvas) return;
    const box = toPixelBox(canvas, seg);
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    let use = { left: box.left, top: box.top, width: box.width, height: box.height };
    if (trim && ctx) {
      const ink = findInkBounds(ctx, box);
      // 글자가 전혀 없는 조각(빈 단 아래쪽 등)은 버린다.
      if (!ink) return;
      use = {
        left: box.left + ink.left,
        top: box.top + ink.top,
        width: Math.min(ink.width, box.width - ink.left),
        height: Math.min(ink.height, box.height - ink.top),
      };
    }
    if (use.width < 8 || use.height < 8) return;
    pieces.push({ canvas, sx: use.left, sy: use.top, sw: use.width, sh: use.height });
  });

  if (pieces.length === 0) return '';

  // 폭을 가장 넓은 조각에 맞추고, 나머지는 비율을 지켜 늘린다.
  let width = Math.max(...pieces.map((p) => p.sw));
  const scaled = pieces.map((p) => ({ ...p, dw: width, dh: Math.round((p.sh * width) / p.sw) }));
  let height = scaled.reduce((sum, p) => sum + p.dh, 0) + SEGMENT_GAP * (scaled.length - 1);

  // 캔버스 한계 안으로 들여놓는다.
  const shrink = Math.min(1, MAX_OUTPUT_DIM / width, MAX_OUTPUT_DIM / height);
  if (shrink < 1) {
    width = Math.floor(width * shrink);
    height = Math.floor(height * shrink);
  }

  const out = document.createElement('canvas');
  out.width = Math.max(1, width);
  out.height = Math.max(1, height);
  const octx = out.getContext('2d');
  if (!octx) return '';
  octx.fillStyle = '#ffffff';
  octx.fillRect(0, 0, out.width, out.height);

  let y = 0;
  scaled.forEach((p, i) => {
    const dw = Math.round(p.dw * shrink);
    const dh = Math.round(p.dh * shrink);
    octx.drawImage(p.canvas, p.sx, p.sy, p.sw, p.sh, 0, y, dw, dh);
    y += dh;
    // 조각 경계에 옅은 구분선을 둬서 이어붙인 지점을 알아볼 수 있게 한다.
    if (i < scaled.length - 1) {
      octx.fillStyle = 'rgba(0,0,0,0.06)';
      octx.fillRect(0, y + Math.floor(SEGMENT_GAP / 2), out.width, 1);
      octx.fillStyle = '#ffffff';
      y += Math.round(SEGMENT_GAP * shrink);
    }
  });

  return out.toDataURL('image/jpeg', options.quality ?? 0.92);
};

/**
 * 페이지 캔버스에서 글자들의 x 좌표 표본을 뽑는다.
 * questionCrop.detectColumnLayout 에 넘겨 단 구성을 판정하는 데 쓴다.
 * (PDF 텍스트 레이어가 없을 때의 대비책 — 있으면 텍스트 좌표를 쓰는 편이 정확하다.)
 */
export const sampleInkColumns = (canvas: HTMLCanvasElement): number[] => {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return [];
  let data: Uint8ClampedArray;
  try {
    data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  } catch {
    return [];
  }
  const xs: number[] = [];
  const step = 3;
  for (let x = 0; x < canvas.width; x += step) {
    let ink = 0;
    for (let y = 0; y < canvas.height; y += step * 2) {
      const i = (y * canvas.width + x) * 4;
      const lum = (data[i] * 299 + data[i + 1] * 587 + data[i + 2] * 114) / 1000;
      if (lum < INK_THRESHOLD) ink += 1;
    }
    // 그 열에 글자가 조금이라도 있으면 표본에 넣는다.
    if (ink > 2) xs.push(x / canvas.width);
  }
  return xs;
};
