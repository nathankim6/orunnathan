/**
 * 시험지에서 "문항 하나"에 해당하는 영역을 잘라내기 위한 계산 모듈.
 *
 * 왜 필요한가
 * -----------
 * 예전에는 문항 영역을 사각형 하나로만 잡았다. 다음 문항 번호를 "같은 페이지,
 * 같은 단" 안에서만 찾았기 때문에, 문항이 1단 아래에서 시작해 2단으로 넘어가거나
 * 다음 페이지로 이어지면 뒷부분이 통째로 잘려 나갔다. 강사가 손으로 영역을
 * 다시 잡아야 했던 이유다.
 *
 * 그래서 문항 영역을 "조각(segment) 목록"으로 표현한다. 읽는 순서
 * (페이지 → 단 → 위에서 아래)대로 다음 문항 번호까지 훑으면서, 단이 바뀌거나
 * 페이지가 바뀌면 조각을 하나 더 만든다. 이 조각들을 세로로 이어 붙이면
 * 단·페이지를 넘는 문항도 하나의 그림이 된다.
 *
 * 이 파일은 브라우저 API 를 쓰지 않는 순수 계산만 담는다(그래서 시험하기 쉽다).
 * 실제 캔버스 합성은 questionCropRender.ts 가 맡는다.
 */

/** 시험지에서 찾아낸 문항 번호 하나의 위치. 좌표는 페이지 기준 0~1. */
export interface NumberMark {
  /** 1부터 시작하는 페이지 번호 */
  page: number;
  /** 문항 번호 */
  number: number;
  /** 왼쪽 위치(0~1) */
  x: number;
  /** 위쪽 위치(0~1) */
  y: number;
  /** 0부터 시작하는 단 번호 */
  column: number;
}

/** 문항 영역을 이루는 조각 하나. 좌표는 페이지 기준 0~1. */
export interface CropSegment {
  page: number;
  xStart: number;
  xEnd: number;
  yStart: number;
  yEnd: number;
}

/** 시험지의 단 구성. bounds[i] = i 번째 단의 [왼쪽, 오른쪽] (0~1) */
export interface ColumnLayout {
  count: number;
  bounds: Array<[number, number]>;
}

/** 번호 바로 위 여백을 조금 포함해 번호가 잘리지 않게 한다. */
const HEAD_PAD = 0.012;
/** 다음 문항 번호 바로 위에서 끊어 다음 문제가 딸려 오지 않게 한다. */
const TAIL_GAP = 0.006;
/** 단 좌우 안쪽 여백 */
const COLUMN_INSET = 0.008;
/** 조각이 이보다 얇으면 의미가 없으므로 버린다. */
const MIN_SEGMENT_HEIGHT = 0.012;
/** 번호 오인식으로 조각이 폭주하는 것을 막는 상한 */
const MAX_SEGMENTS = 8;
/** 번호를 못 찾았을 때 쓰는 기본 높이 */
const FALLBACK_HEIGHT = 0.25;

const SINGLE_COLUMN: ColumnLayout = { count: 1, bounds: [[0, 1]] };
/** 단 사이 빈 띠가 이보다 넓어야 진짜 단 구분으로 본다. */
const MIN_GUTTER = 0.05;
const BIN = 0.02;

/**
 * 본문 글자들의 x 분포에서 "세로로 비어 있는 띠"(단 사이 여백)를 찾아 단 구성을 알아낸다.
 *
 * 문항 번호만 보면 표본이 너무 적어(한 시험지에 20~30개) 단을 잘못 잡는다.
 * 페이지의 모든 글자 x 좌표를 넣으면 단 사이 여백이 뚜렷한 빈 구간으로 드러난다.
 * (예전에는 x < 0.48 로 못박아 두어 1단 시험지나 단 폭이 다른 시험지에서 틀렸다.)
 *
 * @param marks   문항 번호 위치
 * @param sampleXs 페이지 본문 글자들의 x 좌표(있으면 이걸 우선 사용)
 */
export const detectColumnLayout = (marks: NumberMark[], sampleXs?: number[]): ColumnLayout => {
  const xs = (sampleXs && sampleXs.length >= 40 ? sampleXs : marks.map((m) => m.x))
    .filter((x) => Number.isFinite(x) && x >= 0 && x <= 1);
  if (xs.length < 4) return SINGLE_COLUMN;

  const bins = Math.ceil(1 / BIN);
  const filled = new Array<boolean>(bins).fill(false);
  xs.forEach((x) => {
    filled[Math.min(bins - 1, Math.floor(x / BIN))] = true;
  });

  // 가운데 영역에서 가장 넓은 빈 구간을 찾는다.
  const lo = Math.floor(0.15 / BIN);
  const hi = Math.ceil(0.85 / BIN);
  let best = { start: -1, end: -1 };
  let run = -1;
  for (let i = lo; i <= hi; i += 1) {
    if (!filled[i]) {
      if (run < 0) run = i;
      if (i - run > best.end - best.start) best = { start: run, end: i };
    } else {
      run = -1;
    }
  }
  const gutterStart = best.start < 0 ? 0 : best.start * BIN;
  const gutterEnd = best.start < 0 ? 0 : (best.end + 1) * BIN;
  if (gutterEnd - gutterStart < MIN_GUTTER) return SINGLE_COLUMN;

  // 빈 띠 양쪽에 글자가 충분히 있어야 진짜 2단이다.
  const left = xs.filter((x) => x < gutterStart).length;
  const right = xs.filter((x) => x > gutterEnd).length;
  if (left < 2 || right < 2) return SINGLE_COLUMN;

  // 단 경계는 두 무리의 중간이 아니라 빈 띠의 양 끝이다.
  return { count: 2, bounds: [[0, gutterEnd], [gutterStart, 1]] };
};

/** 마크에 단 번호를 다시 매긴다(단 구성을 알아낸 뒤 호출). */
export const assignColumns = (marks: NumberMark[], layout: ColumnLayout): NumberMark[] =>
  marks.map((m) => {
    let column = 0;
    for (let i = 0; i < layout.bounds.length; i += 1) {
      if (m.x >= layout.bounds[i][0] && m.x < layout.bounds[i][1]) column = i;
    }
    return { ...m, column };
  });

/** 읽는 순서: 페이지 → 단 → 위에서 아래 */
export const readingOrder = (a: NumberMark, b: NumberMark): number =>
  a.page - b.page || a.column - b.column || a.y - b.y;

/** 같은 (페이지, 번호) 가 여러 번 잡히면 가장 먼저 읽히는 것만 남긴다. */
export const dedupeMarks = (marks: NumberMark[]): NumberMark[] => {
  const sorted = [...marks].sort(readingOrder);
  const seen = new Set<string>();
  return sorted.filter((m) => {
    const key = `${m.page}:${m.number}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const inset = (bounds: [number, number]): [number, number] => [
  Math.max(0, bounds[0] + (bounds[0] > 0 ? COLUMN_INSET : COLUMN_INSET / 2)),
  Math.min(1, bounds[1] - (bounds[1] < 1 ? COLUMN_INSET : COLUMN_INSET / 2)),
];

/**
 * 문항 하나의 영역을 조각 목록으로 만든다.
 *
 * start 에서 시작해 다음 문항 번호(end)까지, 읽는 순서대로 훑는다.
 * 단이 바뀌거나 페이지가 바뀌면 조각을 새로 만든다.
 * end 가 없으면(문서의 마지막 문항) 자기 단의 끝까지만 잡는다 —
 * 뒤에 붙은 정답표 같은 게 딸려 오지 않게 하기 위해서다.
 */
export const buildSegments = (
  start: NumberMark,
  end: NumberMark | null,
  layout: ColumnLayout,
): CropSegment[] => {
  const segments: CropSegment[] = [];
  const colBounds = (c: number): [number, number] =>
    inset(layout.bounds[Math.min(c, layout.bounds.length - 1)] ?? [0, 1]);

  let page = start.page;
  let column = start.column;
  let y = Math.max(0, start.y - HEAD_PAD);

  const push = (p: number, c: number, y0: number, y1: number) => {
    if (y1 - y0 < MIN_SEGMENT_HEIGHT) return;
    const [xStart, xEnd] = colBounds(c);
    segments.push({ page: p, xStart, xEnd, yStart: y0, yEnd: y1 });
  };

  if (!end) {
    push(page, column, y, 1);
    return segments;
  }

  // end 가 start 보다 앞서면(번호 오인식) 기본 높이로 끊는다.
  if (readingOrder(end, start) <= 0) {
    push(page, column, y, Math.min(1, y + FALLBACK_HEIGHT));
    return segments;
  }

  while ((page < end.page || column < end.column) && segments.length < MAX_SEGMENTS) {
    // 지금 단의 남은 부분을 통째로 담는다.
    push(page, column, y, 1);
    if (column + 1 < layout.count) {
      column += 1;
    } else {
      page += 1;
      column = 0;
    }
    y = 0;
  }

  if (segments.length < MAX_SEGMENTS) {
    push(page, column, y, Math.max(y + MIN_SEGMENT_HEIGHT, end.y - TAIL_GAP));
  }

  return segments;
};

/**
 * 모든 문항의 조각 목록을 한 번에 만든다.
 * 반환: 문항 번호 → 조각 목록
 */
export const buildAllSegments = (
  rawMarks: NumberMark[],
  sampleXs?: number[],
): { layout: ColumnLayout; marks: NumberMark[]; segmentsByNumber: Map<number, CropSegment[]> } => {
  const layout = detectColumnLayout(rawMarks, sampleXs);
  const marks = dedupeMarks(assignColumns(rawMarks, layout));
  const segmentsByNumber = new Map<number, CropSegment[]>();
  marks.forEach((m, i) => {
    const next = marks[i + 1] ?? null;
    segmentsByNumber.set(m.number, buildSegments(m, next, layout));
  });
  return { layout, marks, segmentsByNumber };
};

/** 번호를 못 찾은 문항을 위한 대비책. AI 가 준 y 좌표를 쓰되 없으면 기본값. */
export const fallbackSegments = (
  page: number,
  yStart: number | undefined,
  yEnd: number | undefined,
  layout: ColumnLayout,
): CropSegment[] => {
  const s = Number.isFinite(yStart) ? (yStart as number) : 0;
  const e = Number.isFinite(yEnd) ? (yEnd as number) : Math.min(1, s + FALLBACK_HEIGHT);
  // 단 구성을 모르면 페이지 전체 폭을 쓴다.
  const [xStart, xEnd] = layout.count > 1 ? inset(layout.bounds[0]) : [0, 1];
  return [{ page, xStart, xEnd, yStart: Math.max(0, s), yEnd: Math.min(1, Math.max(s + MIN_SEGMENT_HEIGHT, e)) }];
};
