const IRRELEVANT_HEADER = '다음 글에서 전체 흐름과 관계 없는 문장은?';
const MARKERS = ['①', '②', '③', '④', '⑤'];

const normalizeAnswerMarkers = (text: string) => text
  .replace(/^[ \t]*\*{0,2}정답\*{0,2}[ \t]*[:：][ \t]*/gmi, '[정답] ')
  .replace(/^[ \t]*\*{0,2}정답\*{0,2}[ \t]+(?=[①-⑤1-5])/gmi, '[정답] ')
  .replace(/^[ \t]*\*{0,2}해설\*{0,2}[ \t]*[:：][ \t]*/gmi, '[해설] ')
  .replace(/\*+\s*\[정답\]\s*\*+/g, '[정답]')
  .replace(/\*+\s*\[해설\]\s*\*+/g, '[해설]');

const hasAllMarkers = (text: string) => MARKERS.every(marker => text.includes(marker));

const looksLikePreListedOptions = (block: string) => {
  const lines = block.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  if (lines.length < 4) return false;
  const markerLineCount = lines.filter(line => /^[①-⑤]\s+/.test(line)).length;
  return markerLineCount >= 4;
};

const looksLikeInlinePassage = (block: string) => {
  if (!hasAllMarkers(block) || looksLikePreListedOptions(block)) return false;
  const lines = block.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  return lines.some(line => (line.match(/[①-⑤]/g) || []).length >= 2) || lines.length <= 2;
};

const toSingleParagraph = (block: string) => block
  .split(/\r?\n/)
  .map(line => line.trim())
  .filter(Boolean)
  .join(' ')
  .replace(/[ \t]{2,}/g, ' ')
  .trim();

export const sanitizeIrrelevantQuestionOutput = (input: string): string => {
  let text = normalizeAnswerMarkers(input)
    .replace(/^#+\s*.+$/gm, '')
    .replace(/^---+$/gm, '')
    .trim();

  const answerStart = text.search(/\[정답\]/);
  const beforeAnswer = answerStart >= 0 ? text.slice(0, answerStart).trim() : text;
  const answerPart = answerStart >= 0 ? text.slice(answerStart).trim() : '';

  const withoutHeader = beforeAnswer
    .replace(new RegExp(IRRELEVANT_HEADER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '')
    .trim();

  const paragraphCandidates = withoutHeader
    .split(/\n\s*\n/)
    .map(block => block.trim())
    .filter(Boolean)
    .filter(looksLikeInlinePassage);

  let passage = paragraphCandidates.at(-1);

  if (!passage) {
    const inlineLine = withoutHeader
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean)
      .reverse()
      .find(line => hasAllMarkers(line) && !looksLikePreListedOptions(line));
    passage = inlineLine;
  }

  if (!passage) return text;

  const cleanedPassage = toSingleParagraph(passage);
  return [IRRELEVANT_HEADER, cleanedPassage, answerPart].filter(Boolean).join('\n\n');
};
