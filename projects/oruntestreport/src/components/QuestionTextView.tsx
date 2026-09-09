import React from 'react';
import type { QuestionText } from '@/utils/questionText';

/**
 * 시험지에서 뽑아낸 문항을 리포트 서체로 다시 조판해 보여 준다.
 *
 * 그림으로 넣으면 확대하면 흐려지고 리포트와 서체가 따로 놀지만, 글자로
 * 조판하면 선명하고 리포트의 나머지 부분과 하나로 읽힌다.
 *
 * 색은 전부 테마 토큰(--ink, --gold, --paper …)만 쓴다.
 * mem/design/multi-hue-category-palette.md 의 규약대로 하드코딩 금지이며,
 * 화려함은 색이 아니라 여백 · 헤어라인 · 서체 위계로 만든다.
 */

interface Props {
  text: QuestionText;
  /** 문항 번호(발문에 이미 들어 있으면 생략된다) */
  number?: number;
  /** 배점 · 유형 등 곁들임 정보 */
  meta?: string;
  /** 밑줄·표 때문에 원본 그림을 함께 보여줘야 할 때 */
  imageUrl?: string;
  className?: string;
  /** 촘촘하게(검수 화면용) */
  dense?: boolean;
}

/** 선택지 줄에서 ①②③ 같은 표시와 본문을 나눈다. */
const splitChoice = (line: string): { marker: string; body: string } => {
  const m = line.match(/^\s*([①-⑮]|\(\s*[1-9]\s*\)|[1-9]\s*\))\s*(.*)$/);
  if (!m) return { marker: '', body: line };
  return { marker: m[1].trim(), body: m[2] };
};

/** 선택지가 이보다 짧으면 한 줄에 나란히 놓는다(시험지 조판과 같게). */
const INLINE_CHOICE_MAX = 24;

/** 발문 앞머리의 "3." 같은 번호를 떼어낸다(번호는 따로 배지로 보여 주므로). */
const stripLeadingNumber = (stem: string): string =>
  stem.replace(/^\s*\d{1,3}\s*[.)]\s*/, '');

const QuestionTextView: React.FC<Props> = ({
  text,
  number,
  meta,
  imageUrl,
  className = '',
  dense = false,
}) => {
  const stem = stripLeadingNumber(text.stem);
  const hasText = text.charCount > 0 && (stem || text.body.length > 0);
  const inlineChoices =
    text.choices.length > 0 && text.choices.every((c) => c.trim().length <= INLINE_CHOICE_MAX);

  return (
    <article
      className={`relative overflow-hidden rounded-xl border bg-[hsl(var(--paper))] ${className}`}
      style={{ borderColor: 'hsl(var(--ink) / 0.12)' }}
    >
      {/* 위쪽 가는 금빛 선 — 편집 디자인 느낌의 최소한의 장식 */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, hsl(var(--gold) / 0.55), transparent)',
        }}
      />

      <header className={`flex items-start gap-3 ${dense ? 'px-3 pt-3' : 'px-5 pt-5'}`}>
        {number !== undefined && (
          <span
            className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[12px] font-bold tabular-nums"
            style={{ background: 'hsl(var(--gold) / 0.16)', color: 'hsl(var(--gold-deep))' }}
          >
            {number}
          </span>
        )}
        <div className="min-w-0 flex-1">
          {stem && (
            <p
              className={`font-semibold leading-snug ${dense ? 'text-[13px]' : 'text-[15px]'}`}
              style={{ color: 'hsl(var(--ink))' }}
            >
              {stem}
            </p>
          )}
          {meta && (
            <p className="mt-1 text-[11px]" style={{ color: 'hsl(var(--ink-soft))' }}>
              {meta}
            </p>
          )}
        </div>
      </header>

      {text.body.length > 0 && (
        <div
          className={`${dense ? 'mx-3 mt-2.5 p-3' : 'mx-5 mt-4 p-4'} rounded-lg`}
          style={{ background: 'hsl(var(--paper-warm))' }}
        >
          <p
            className={`whitespace-pre-line break-words text-justify ${
              dense ? 'text-[12px] leading-[1.75]' : 'text-[13.5px] leading-[1.9]'
            }`}
            style={{ color: 'hsl(var(--ink) / 0.92)' }}
          >
            {text.body.map((l) => l.text).join('\n')}
          </p>
        </div>
      )}

      {text.choices.length > 0 && (
        // 선택지가 짧으면 실제 시험지처럼 한 줄에 늘어놓고, 길면 한 줄에 하나씩 둔다.
        <ul
          className={`${dense ? 'px-3 pt-2.5' : 'px-5 pt-4'} ${
            inlineChoices ? 'flex flex-wrap gap-x-6 gap-y-1.5' : 'space-y-1.5'
          }`}
        >
          {text.choices.map((line, i) => {
            const { marker, body } = splitChoice(line);
            return (
              <li
                key={i}
                className={`flex gap-2 ${dense ? 'text-[12px]' : 'text-[13px]'}`}
                style={{ color: 'hsl(var(--ink) / 0.88)' }}
              >
                {marker && (
                  <span className="shrink-0 font-semibold" style={{ color: 'hsl(var(--gold-deep))' }}>
                    {marker}
                  </span>
                )}
                <span className="min-w-0 break-words">{body}</span>
              </li>
            );
          })}
        </ul>
      )}

      {imageUrl && (
        <figure className={`${dense ? 'px-3 pt-3' : 'px-5 pt-4'}`}>
          {hasText && (
            <figcaption
              className="editorial-kicker mb-1.5 text-[9px] tracking-[0.3em]"
              style={{ color: 'hsl(var(--ink-soft))' }}
            >
              시험지 원본
            </figcaption>
          )}
          <img
            src={imageUrl}
            alt={`${number ?? ''}번 문항 원본`}
            className="w-full rounded-lg border"
            style={{ borderColor: 'hsl(var(--ink) / 0.1)' }}
          />
        </figure>
      )}

      {!hasText && !imageUrl && (
        <p className={`${dense ? 'px-3 py-4' : 'px-5 py-6'} text-[12px]`} style={{ color: 'hsl(var(--ink-soft))' }}>
          이 문항의 글자를 읽지 못했습니다. 스캔한 시험지라면 원본 그림으로 대신합니다.
        </p>
      )}

      <div className={dense ? 'h-3' : 'h-5'} />
    </article>
  );
};

export default QuestionTextView;
