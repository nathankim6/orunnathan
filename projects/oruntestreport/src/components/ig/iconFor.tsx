import React from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  SpellCheck, PenLine, BookOpen, Shuffle, ListOrdered, Quote, Puzzle, Flame,
  Braces, ScrollText, ArrowLeftRight, Type, Highlighter, Target, Lightbulb,
} from 'lucide-react';

/**
 * 글 제목에서 아이콘을 고른다.
 *
 * 레퍼런스는 항목마다 아이콘이 있다(공장, 풍력, 날씨). 우리 데이터에는 아이콘 필드가
 * 없으므로 제목의 낱말로 고른다. 못 고르면 반짝이 아이콘으로 떨어진다. 틀린 아이콘보다
 * 평범한 아이콘이 낫기 때문에, 규칙은 보수적으로 둔다.
 */
const RULES: { test: RegExp; icon: LucideIcon }[] = [
  { test: /어법|문법|grammar/i, icon: SpellCheck },
  { test: /서답형|서술|영작|쓰기|write/i, icon: PenLine },
  // 변형 규칙이 지문 규칙보다 먼저다. "변형 지문" 은 변형 쪽 아이콘이어야 한다.
  { test: /변형|치환|바꾼|paraphras|swap/i, icon: Shuffle },
  { test: /부교재|교과서|지문|본문|read/i, icon: BookOpen },
  { test: /순서|배열|삽입|order|insert/i, icon: ListOrdered },
  { test: /요약|summary/i, icon: ScrollText },
  { test: /어휘|단어|vocab|word/i, icon: Type },
  { test: /빈칸|blank/i, icon: Puzzle },
  { test: /함축|의미|추론|infer/i, icon: Quote },
  { test: /킬러|최고난도|killer/i, icon: Flame },
  { test: /대조|비교|원문/i, icon: ArrowLeftRight },
  { test: /구문|구조|structure/i, icon: Braces },
  { test: /핵심|포인트|target/i, icon: Target },
  { test: /강조|밑줄/i, icon: Highlighter },
];

export const iconFor = (text: string | undefined, props: { className?: string; strokeWidth?: number } = {}) => {
  const t = text || '';
  const hit = RULES.find((r) => r.test.test(t));
  const Icon = hit ? hit.icon : Lightbulb;
  return <Icon className={props.className ?? 'w-6 h-6'} strokeWidth={props.strokeWidth ?? 1.75} />;
};

export default iconFor;
