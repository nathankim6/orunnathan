/**
 * 문항 영역(questionCrop.ts 가 계산한 조각들) 안의 글자를 그대로 뽑아
 * "문제 포맷"을 살린 구조로 만든다.
 *
 * 왜 그림 대신 글자인가
 * ---------------------
 * 그림으로 잘라 넣으면 확대하면 흐려지고, 리포트 폭에 따라 글자 크기가 제멋대로
 * 바뀌고, 검색·복사가 안 되고, 저장 용량도 크다. 글자로 다시 조판하면 이 문제가
 * 전부 사라지고 리포트의 다른 부분과 서체·색이 하나로 맞는다.
 *
 * 중요한 점: 글자는 AI 에게 물어보지 않고 PDF 안의 텍스트 레이어에서 그대로
 * 가져온다. AI 가 옮겨 적으면 지문이 길수록 틀릴 수 있지만, 텍스트 레이어는
 * 시험지에 인쇄된 바로 그 문자열이라 틀릴 수가 없다.
 *
 * 다만 글자로 못 담는 것이 있다: 밑줄·네모 같은 선, 표, 그림, 그래프.
 * 이런 건 PDF 에서 그리기 명령이지 글자가 아니다. 그래서 줄 사이가 유난히
 * 벌어진 자리가 있으면(=그 자리에 표나 그림이 있으면) 또는 글자가 너무 적으면
 * 그림 크롭을 함께 쓰도록 needsImage 로 알려 준다.
 */
import type { CropSegment } from './questionCrop';

/** PDF 한 페이지에서 뽑아 둔 글자 조각 하나. 좌표는 페이지 기준 0~1. */
export interface TextPiece {
  str: string;
  /** 왼쪽 */
  x: number;
  /** 글자 아랫줄(baseline) 위치 */
  y: number;
  /** 글자 높이(줄 묶기와 글자 크기 판단에 쓴다) */
  h: number;
  /** 글자 폭 */
  w: number;
}

export interface QuestionLine {
  text: string;
  /** 이 줄의 대표 글자 높이(0~1). 제목/본문 구분에 쓴다. */
  size: number;
}

export interface QuestionText {
  /** 문항 번호 줄(예: "3. 다음 빈칸에 들어갈 말로 가장 적절한 것은?") */
  stem: string;
  /** 지문 줄들 */
  body: QuestionLine[];
  /** 선택지 줄들(①~⑤ 로 시작하는 줄) */
  choices: string[];
  /** 영역 안 글자가 너무 적으면(표·그림 위주) 그림도 함께 보여줘야 한다. */
  needsImage: boolean;
  /** 뽑아낸 글자 수 — 0 이면 텍스트 레이어가 없는 스캔본이다. */
  charCount: number;
}

/** 선택지 시작 표시: ①~⑮ 또는 (1) 1) 같은 형태 */
const CHOICE_RE = /^\s*(?:[①-⑮]|\(\s*[1-9]\s*\)|[1-9]\s*\))/;
/** 같은 줄로 묶을 세로 허용 오차(글자 높이 대비) */
const LINE_TOLERANCE = 0.6;
/** 글자 사이가 이보다 벌어지면 공백을 넣는다(글자 높이 대비) */
const SPACE_GAP = 0.28;
/** 줄 사이가 보통 줄 간격의 이 배를 넘으면 그 자리에 그림·표가 있다고 본다. */
const FIGURE_GAP_RATIO = 4;
/** 이보다 글자가 적으면 글자만으로는 문항을 담을 수 없다고 본다. */
const MIN_CHARS = 20;

const inSegment = (p: TextPiece, s: CropSegment): boolean =>
  p.y >= Math.min(s.yStart, s.yEnd) &&
  p.y <= Math.max(s.yStart, s.yEnd) &&
  p.x >= Math.min(s.xStart, s.xEnd) - 0.01 &&
  p.x <= Math.max(s.xStart, s.xEnd);

/** 같은 baseline 의 글자들을 한 줄로 묶는다. */
const groupIntoLines = (pieces: TextPiece[]): QuestionLine[] => {
  const sorted = [...pieces].sort((a, b) => a.y - b.y || a.x - b.x);
  const lines: QuestionLine[] = [];
  let bucket: TextPiece[] = [];

  const flush = () => {
    if (bucket.length === 0) return;
    const ordered = [...bucket].sort((a, b) => a.x - b.x);
    let text = '';
    ordered.forEach((piece, i) => {
      if (i > 0) {
        const prev = ordered[i - 1];
        const gap = piece.x - (prev.x + prev.w);
        if (gap > prev.h * SPACE_GAP) text += ' ';
      }
      text += piece.str;
    });
    const size = Math.max(...ordered.map((p) => p.h));
    const trimmed = text.replace(/\s+/g, ' ').trim();
    if (trimmed) lines.push({ text: trimmed, size });
    bucket = [];
  };

  sorted.forEach((piece) => {
    if (bucket.length === 0) {
      bucket.push(piece);
      return;
    }
    const ref = bucket[bucket.length - 1];
    if (Math.abs(piece.y - ref.y) <= ref.h * LINE_TOLERANCE) bucket.push(piece);
    else {
      flush();
      bucket.push(piece);
    }
  });
  flush();
  return lines;
};

/**
 * 문항의 조각들 안에 있는 글자를 읽는 순서대로 모아 문제 구조로 만든다.
 *
 * @param piecesByPage 1페이지부터 순서대로, 페이지별 글자 조각 목록
 * @param segments     questionCrop 이 만든 조각 목록
 */
export const extractQuestionText = (
  piecesByPage: TextPiece[][],
  segments: CropSegment[],
): QuestionText => {
  const lines: QuestionLine[] = [];
  // 그림·표는 "글자가 있어야 할 자리에 글자가 없는 것"으로 드러난다.
  // 조각 경계에서 생기는 간격은 진짜 빈틈이 아니므로 조각별로 따로 본다.
  let figureGap = false;

  segments.forEach((seg) => {
    const pieces = (piecesByPage[seg.page - 1] ?? []).filter((p) => inSegment(p, seg));
    const segLines = groupIntoLines(pieces);
    const ys = [...pieces].sort((a, b) => a.y - b.y);
    if (ys.length >= 3) {
      const gaps: number[] = [];
      for (let i = 1; i < ys.length; i += 1) {
        const g = ys[i].y - ys[i - 1].y;
        if (g > 0) gaps.push(g);
      }
      if (gaps.length >= 2) {
        const sortedGaps = [...gaps].sort((a, b) => a - b);
        const typical = sortedGaps[Math.floor(sortedGaps.length / 2)] || 0;
        if (typical > 0 && Math.max(...gaps) > typical * FIGURE_GAP_RATIO) figureGap = true;
      }
    }
    lines.push(...segLines);
  });

  const charCount = lines.reduce((n, l) => n + l.text.length, 0);

  // 첫 줄은 문항 번호 + 발문
  const stem = lines.length > 0 ? lines[0].text : '';
  const rest = lines.slice(1);

  // 뒤에서부터 선택지를 걷어낸다(선택지는 항상 문항 끝에 모여 있다).
  const choices: string[] = [];
  let cut = rest.length;
  for (let i = rest.length - 1; i >= 0; i -= 1) {
    if (CHOICE_RE.test(rest[i].text)) {
      choices.unshift(rest[i].text);
      cut = i;
    } else if (choices.length > 0) {
      break;
    }
  }

  return {
    stem,
    body: rest.slice(0, cut),
    choices,
    needsImage: charCount < MIN_CHARS || figureGap,
    charCount,
  };
};

/**
 * 이 문항을 글자만으로 담을 수 있는지 판단한다.
 *
 * 어법·어휘 문제는 "밑줄 친 (a)~(e)" 나 네모 상자가 문제의 핵심인데,
 * 밑줄과 네모는 PDF 에서 글자가 아니라 선을 그린 것이라 텍스트로는 살아나지
 * 않는다. (a) (b) 같은 표시 자체는 글자로 나오지만 어디에 밑줄이 그어졌는지가
 * 사라지면 문제가 성립하지 않는다. 그래서 이런 유형은 시험지 그림을 쓴다.
 *
 * 판단 재료는 셋이다.
 *  1. AI 가 직접 알려 준 값(markupDependent) — 가장 정확하다.
 *  2. 대분류·소분류의 낱말 — AI 표시가 없을 때의 대비책.
 *  3. 글자 추출 결과(표·그림이 섞였거나 스캔본이라 글자가 없는 경우).
 */
const MARKUP_KEYWORDS = [
  '밑줄', '네모', '상자', '어법', '문법', '어휘', '지칭', '지시', '가리키는',
  '어색한', '틀린 것', '쓰임이', '바꿔 쓸',
];

export interface MarkupHints {
  /** 대분류 */
  category?: string;
  /** 소분류 · 문제 유형 */
  name?: string;
  /** AI 가 "밑줄·네모가 있어야 성립하는 문항"이라고 표시한 값 */
  markupDependent?: boolean;
}

export const needsOriginalImage = (hints: MarkupHints, text: QuestionText): boolean => {
  // 표·그림이 섞였거나 스캔본이면 밑줄 여부와 무관하게 그림이 필요하다.
  if (text.needsImage) return true;
  // AI 는 실제 문제를 읽고 판단하므로 낱말 규칙보다 우선한다.
  // 특히 AI 가 "밑줄 없음"이라고 한 것을 대분류 낱말만 보고 뒤집으면 안 된다.
  if (hints.markupDependent !== undefined) return hints.markupDependent;
  const haystack = `${hints.category ?? ''} ${hints.name ?? ''}`;
  return MARKUP_KEYWORDS.some((k) => haystack.includes(k));
};
