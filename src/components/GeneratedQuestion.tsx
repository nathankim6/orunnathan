import { useState, useRef, useEffect } from "react";
import { DefaultQuestion } from "./question-types/DefaultQuestion";
import { WeekendClinicQuestion } from "./question-types/WeekendClinicQuestion";
import { TrueFalseQuestion } from "./question-types/TrueFalseQuestion";
import { SummaryBlankQuestion } from "./question-types/SummaryBlankQuestion";
import { OrderWritingQuestion } from "./question-types/OrderWritingQuestion";
import { ConditionWritingQuestion } from "./question-types/ConditionWritingQuestion";
import { GrammarQuestion } from "./question-types/GrammarQuestion";
import { RefreshCcw, Copy, FileDown, Tag } from "lucide-react";
import { Button } from "./ui/button";
import { generateQuestion } from "@/lib/claude";
import { useToast } from "@/hooks/use-toast";
import { TextWithUnderline, convertAsteriskToUnderline, copyTextWithUnderlines } from "./ui/underlined-text";
import { generateSingleQuestionHWP } from "@/utils/singleQuestionGenerator";
import { validateAndFixSummaryBlankWriting } from "@/utils/summaryBlankWritingValidator";
import { getQuestionTypes } from "@/lib/questionTypes";
import { sanitizeIrrelevantQuestionOutput } from "@/lib/irrelevantSanitizer";

// School logo mapping
const getSchoolLogo = (typeId?: string): string | null => {
  if (!typeId) return null;
  const typeName = getQuestionTypeName(typeId);
  if (!typeName) return null;
  
  if (typeName.includes('성남') || typeId.startsWith('seongnam')) {
    return '/lovable-uploads/seongnam-logo.png';
  }
  if (typeName.includes('괌') || typeId.startsWith('guam') || typeId === 'guamDictionary' || typeId === 'guamTableFillBlanks') {
    return '/lovable-uploads/guam-logo.png';
  }
  if (typeName.includes('오룬') || typeId.startsWith('orun')) {
    return '/lovable-uploads/orun-academy-logo.png';
  }
  if (typeName.includes('흑석') || typeId.startsWith('heukseok')) {
    return '/lovable-uploads/heukseok-logo.png';
  }
  return null;
};

// Get question type name from ID
const getQuestionTypeName = (typeId?: string): string | null => {
  if (!typeId) return null;
  const types = getQuestionTypes();
  const found = types.find(t => t.id === typeId);
  return found?.name || null;
};

interface GeneratedQuestionProps {
  content: string;
  questionNumber: number;
  originalText?: string;
  showVocabButton?: boolean;
  onRefresh?: (newContent: string) => void;
  questionType?: string;
}
export const GeneratedQuestion = ({
  content,
  questionNumber,
  originalText,
  showVocabButton = true,
  onRefresh,
  questionType
}: GeneratedQuestionProps) => {
  const [isVocabModalOpen, setIsVocabModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [localContent, setLocalContent] = useState<string | null>(null);
  const refreshIdRef = useRef(0);
  const { toast } = useToast();

  // Reset local content when external content changes (from initial generation)
  // But only if we're not currently refreshing
  useEffect(() => {
    if (!isRefreshing && localContent === null) {
      // Don't reset - let external content flow through
    }
  }, [content, isRefreshing]);

  const handleRefresh = async () => {
    if (!originalText || !questionType || !onRefresh) return;
    
    // Increment refresh ID to track this specific request
    const currentRefreshId = ++refreshIdRef.current;
    
    setIsRefreshing(true);
    setLocalContent(content); // Preserve current content during refresh
    
    try {
      const result = await generateQuestion({
        id: questionType,
        name: ""
      }, originalText, "1");
      
      // Only apply result if this is still the latest refresh request
      if (currentRefreshId === refreshIdRef.current) {
        setLocalContent(result);
        onRefresh(result);
        toast({
          title: "문제 재생성 완료",
          description: "문제가 성공적으로 재생성되었습니다."
        });
      }
    } catch (error) {
      // Only show error if this is still the latest refresh request
      if (currentRefreshId === refreshIdRef.current) {
        setLocalContent(null); // Reset to use external content
        toast({
          title: "문제 재생성 실패",
          description: "문제 재생성 중 오류가 발생했습니다.",
          variant: "destructive"
        });
      }
    } finally {
      if (currentRefreshId === refreshIdRef.current) {
        setIsRefreshing(false);
      }
    }
  };

  // Use local content if available (during/after refresh), otherwise use prop
  const displayContent = localContent !== null ? localContent : content;
  const handleCopy = async () => {
    const success = await copyTextWithUnderlines(processedContent);
    toast({
      title: success ? "복사 완료" : "복사 실패",
      description: success 
        ? "문제가 서식과 함께 복사되었습니다. HWP에서 밑줄이 보이지 않으면 'HWP 저장' 버튼을 사용해보세요." 
        : "텍스트 복사에 실패했습니다.",
      variant: success ? "default" : "destructive"
    });
  };

  const handleSaveToHWP = async () => {
    try {
      const result = await generateSingleQuestionHWP(processedContent, questionNumber, "hwp");
      toast({
        title: result.success ? "HWP 저장 완료" : "저장 실패",
        description: result.success 
          ? "문제가 HWP 파일로 저장되었습니다. (밑줄 포함)" 
          : result.error || "HWP 저장 중 오류가 발생했습니다.",
        variant: result.success ? "default" : "destructive"
      });
    } catch (error) {
      toast({
        title: "저장 실패",
        description: "HWP 저장 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  const RefreshButton = () => (
    <div className="absolute top-4 right-4 flex gap-2 z-10">
      <Button variant="outline" size="sm" onClick={handleCopy} title="클립보드에 복사">
        <Copy className="h-4 w-4" />
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleRefresh} 
        disabled={isRefreshing || !originalText || !questionType} 
        title="문제 재출제"
        className="hover:bg-blue-50 hover:border-blue-300"
      >
        <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-blue-500' : ''}`} />
        <span className="ml-1.5 text-xs">재출제</span>
      </Button>
    </div>
  );

  // Validate and fix content based on question type
  const isSummaryBlankWriting = questionType === 'summaryBlankWriting';
  let validatedContent = displayContent;
  
  if (isSummaryBlankWriting) {
    validatedContent = validateAndFixSummaryBlankWriting(displayContent);
  }

  // Check if this is an order question
  const isOrderQuestion = validatedContent.includes('주어진 글 다음에 이어질 글의 순서로 가장 적절한 것을 고르시오') ||
    validatedContent.includes('다음 글의 순서로 가장 적절한 것을 고르시오') ||
    validatedContent.includes('[36-37] 순서');
  
  // Check if this is an insert question
  const isInsertQuestion = validatedContent.includes('글의 흐름으로 보아, 주어진 문장이 들어가기에 가장 적절한 곳을 고르시오');
  
  // Check if this is a summary question
  const isSummaryQuestion = validatedContent.includes('다음 글의 내용을 한 문장으로 요약하고자 한다');
  const summaryBlankMarkup = '<u>            </u>';

  const formatSummaryQuestionBlanks = (input: string) => {
    if (!isSummaryQuestion) return input;

    return input
      .replace(
        /\(([A-C])\)\s*[A-Za-z][A-Za-z-]*(?:\s+[A-Za-z][A-Za-z-]*){0,2}\s*\/\s*[A-Za-z][A-Za-z-]*(?:\s+[A-Za-z][A-Za-z-]*){0,2}/g,
        (_, label) => `(${label}) ${summaryBlankMarkup}`
      )
      .replace(/\(([A-C])\)\s*_{3,}/g, (_, label) => `(${label}) ${summaryBlankMarkup}`)
      .replace(/\(([A-C])\)\s*<u>\s*(?:_+|&nbsp;|\s)+<\/u>/g, (_, label) => `(${label}) ${summaryBlankMarkup}`);
  };
  
  // Check if this is a table fill blanks question or grammar correction (should preserve tables)
  const isTableQuestion = questionType === 'guamTableFillBlanks' || questionType === 'grammarCorrection' || questionType === 'grammarSelection' || questionType === 'seongnamSummaryTableBlank';

  // Process content to clean up
  let processedContent = validatedContent
    .replace(/\[OUTPUT\]\s*/gi, '')
    .replace(/\[OUPUT\]\s*/gi, '')
    .replace(/\[선지\]/g, '') // Remove [선지] text
    .replace(/\[선택지\]/g, '') // Remove [선택지] text
    // Normalize various 정답 markers to [정답] so the parser/renderer recognizes them
    .replace(/^[ \t]*\*{0,2}정답\*{0,2}[ \t]*\][ \t]*/gm, '[정답] ')        // "정답] 4번" → "[정답] 4번"
    .replace(/^[ \t]*\*{0,2}정답\*{0,2}[ \t]*:[ \t]*/gm, '[정답] ')         // "정답: ①번" → "[정답] ①번"
    .replace(/^[ \t]*\*{0,2}정답\*{0,2}[ \t]+(?=[①-⑩\d])/gm, '[정답] ')     // "정답 ①" → "[정답] ①"
    .replace(/^[ \t]*\*{0,2}해설\*{0,2}[ \t]*:[ \t]*/gm, '[해설] ')         // "해설:" → "[해설] "
    // Remove markdown headers
    .replace(/^#+ .+$/gm, '')
    .replace(/^---+$/gm, '');

  // Safety net for [35] irrelevant sentence: strip pre-listed ①~⑤ lines & meta blocks
  // when the actual passage with inline markers exists later in the output.
  const isIrrelevantQuestion =
    questionType === 'irrelevant' ||
    /다음 글에서 전체 흐름과 관계\s*없는 문장은\?/.test(processedContent);
  if (isIrrelevantQuestion) {
    processedContent = sanitizeIrrelevantQuestionOutput(processedContent);
  }

  
  // For summary questions (esp. 3-blank), if the LLM emitted choices as a markdown table,
  // convert them to plain "① a    b    c" lines BEFORE the destructive table strip below.
  if (isSummaryQuestion) {
    const lines = processedContent.split('\n');
    const out: string[] = [];
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();
      // Detect a header row like "| | (A) | (B) | (C) |" or "| (A) | (B) | (C) |"
      const isHeader = /^\|.*\(A\).*\|.*\(B\).*\|.*\(C\).*\|/.test(trimmed);
      if (isHeader) {
        // Skip header + optional separator
        i++;
        if (i < lines.length && /^\|[\s\-:|]+\|\s*$/.test(lines[i].trim())) i++;
        // Collect data rows
        const rows: string[][] = [];
        while (i < lines.length && /^\|.*\|$/.test(lines[i].trim())) {
          const cells = lines[i].trim().slice(1, -1).split('|').map(c => c.trim());
          rows.push(cells);
          i++;
        }
        // Render as plain lines: first cell is marker (①~⑤), remaining are (A)(B)(C)
        out.push('       (A)          (B)          (C)');
        for (const r of rows) {
          if (r.length >= 4) {
            const [mark, a, b, c] = [r[0], r[1], r[2], r[3]];
            out.push(`${mark}  ${a}    ${b}    ${c}`);
          } else if (r.length === 3) {
            // No leading marker col; synthesize from index
            const idx = rows.indexOf(r);
            const numerals = ['①','②','③','④','⑤'];
            out.push(`${numerals[idx] || ''}  ${r[0]}    ${r[1]}    ${r[2]}`);
          }
        }
        continue;
      }
      out.push(line);
      i++;
    }
    processedContent = out.join('\n');
  }

  // Only remove table formatting for non-table questions
  if (!isTableQuestion && !isSummaryQuestion) {
    processedContent = processedContent
      // Remove multiple choice tables for summary questions
      .replace(/\|\s*\|\s*\(A\)\s*\|\s*\(B\)\s*\|\s*\(C\)\s*\|[\s\S]*?(?=\[정답\]|\[해설\]|$)/g, '')
      .replace(/\|\s*-+\s*\|\s*-+\s*\|\s*-+\s*\|\s*-+\s*\|/g, '')
      .replace(/\|\s*[①-⑤]\s*\|[^|]+\|[^|]+\|[^|]+\|/g, '')
      // Remove markdown table headers like ||(A)||(B)||(C)|| and |---|---|---|
      .replace(/\|+\s*\(A\)\s*\|+\s*\(B\)\s*\|+\s*\(C\)\s*\|+/g, '')
      .replace(/\|[-|]+\|/g, '')
      .replace(/^\|.*\|$/gm, '');
  }

  
  processedContent = processedContent
    .replace(/\n+(다음 빈칸에 들어갈 말로 가장 적절한 것을 고르시오\.)/g, '$1')
    .replace(/(다음 빈칸에 들어갈 말로 가장 적절한 것을 고르시오\.)\n\n/g, '$1\n')
    .replace(/([^\n])\n\n+(?=<box>)/g, '$1\n')
    .replace(/\n\n+(다음 글의.*?것은\?)/g, '\n$1')
    .replace(/(다음 글의.*?것은\?)\n\n/g, '$1\n')
    .replace(/(\[정답\].*?)\n\n(\[해설\])/g, '$1\n$2')
    .replace(/(\[정답\].*?)\n(\[해설\])/g, '$1\n$2')
    // 정답과 해설의 밑줄 표시 제거 (우선 처리)
    .replace(/\*\*\[정답\]\*\*/g, '[정답]')
    .replace(/\*\*\[해설\]\*\*/g, '[해설]')
    .replace(/\*\*정답[:：\s]?\*\*/g, '[정답]')
    .replace(/\*\*해설[:：\s]?\*\*/g, '[해설]')
    // 정답:, 정답 :, 정답 등 모든 패턴을 [정답]으로 통일
    .replace(/정답\s*[:：]\s*/g, '[정답] ')
    .replace(/해설\s*[:：]\s*/g, '[해설] ')
    .replace(/(^|\n)정답\s+/gm, '$1[정답] ')
    .replace(/(^|\n)해설\s+/gm, '$1[해설] ')
    .replace(/\[정답\]\s+\[정답\]/g, '[정답]') // 중복 제거
    .replace(/\[해설\]\s+\[해설\]/g, '[해설]') // 중복 제거
    .replace(/\[해설\]\s*\n/g, '[해설] ')
    .replace(/\[해설\]\n/g, '[해설] ')
    .replace(/(다음의 내용과 일치.*?것을 고르시오\.)\n\n([A-Z])/g, '$1\n$2')
    .replace(/(\?)\n\n([A-Z])/g, '$1\n$2')
    .replace(/\*\*(다음 중 어법상 적절하지 않은 것은\?)\*\*/g, '$1')
    .replace(/(다음 중 어법상 적절하지 않은 것은\?)\n\n/g, '$1\n')
    .replace(/다음 중 어법상 적절하지 않은 것은\?\n(?=다음)/g, '')
    .replace(/다음 중 어법 상 적절하지 않은 것은\?\n*/g, '')
    .replace(/(?<!문맥상 낱말의 쓰임이 적절하지 않은 것은\?[\s\S]*?)\d+\) [①-⑤]\n/g, '')
    .replace(/1\) ①\n2\) ②\n3\) ③\n4\) ④\n5\) ⑤\n?/g, '')
    .replace(/\d+\) [A-Za-z]+(?:\d+\) [A-Za-z]+)*/g, '')
    .replace(/([A-Za-z]+\s*→\s*[A-Za-z]+\s*\([①-⑤]\):.*?\n)+/g, '')
    .replace(/\n\n(다음 글의 빈 칸에)/g, '\n$1')
    .replace(/\[선지\]/g, '')
    .replace(/(\[정답\])\s*([①-⑤])\s*\n(\[해설\])/g, '$1 $2\n$3')
    // Ensure exactly one blank line before [정답] - improved pattern
    .replace(/(⑤[^\n]+)\n*\s*(\[정답\])/g, '$1\n\n$2') // After last choice
    .replace(/([^⑤\n])\n*\s*(\[정답\])/g, '$1\n\n$2') // Any other case
    .replace(/\n{3,}(\[정답\])/g, '\n\n$1') // Reduce multiple blank lines to exactly one
    .replace(/(다음 글을 읽고[^\n]+)\n\n+([A-Z])/g, '$1\n$2') // Remove blank line between Korean question and English passage
    .replace(/(\?)\n\n+(\[선지\]\s*)?([①-⑤])/g, '$1\n$3')
    // AFTER removing extra blank lines, ensure <보기> questions have exactly one blank line before choices
    .replace(/(j\.\s*[^\n]+)\n(①)/g, '$1\n\n$2')
    .replace(/\[어휘\][\s\S]*?(?=\n\n|$)/g, '')
    .replace(/원문의 빈칸 표현:.*?$/gm, '')
    .replace(/(다음 중 문맥 상 알맞은 단어를 고르시오\.)\n\n/g, '$1\n')
    .replace(/(\[서답형\] 다음 글을 읽고, 물음에 답하시오\.)\n\n/g, '$1\n')
    .replace(/(다음 글의 내용과 일치하도록.*?쓰시오\.)\n\n/g, '$1\n')
    .replace(/^([①-⑤]\s+[^.\n]+)\.\s*$/gm, '$1') // Remove periods at end of choice lines
    .replace(/(배열하시오\.?\n)([^\n]+)/g, (match, p1, p2) => {
      // Remove commas and periods from word lists after "배열하시오"
      return p1 + p2.replace(/[.,]/g, '');
    })
    .replace(/(\[해설\][\s\S]*?)(?=\n\n[^\[①-⑤]|$)/g, (match) => {
      // Remove all blank lines within the explanation section
      return match.replace(/\n\n+/g, '\n');
    })
    // Clean up multiple consecutive newlines
    .replace(/\n{3,}/g, '\n\n')
    // Remove leading/trailing whitespace from lines
    .replace(/^\s+$/gm, '');

  // Strip stray </box> tags that the AI accidentally placed on a choice line (①~⑩).
  // The box should close BEFORE the choices, so move/remove any </box> attached to a choice line.
  processedContent = processedContent.replace(
    /^([①-⑩][^\n]*?)<\/box>[ \t]*\r?\n?/gm,
    '$1\n'
  );
  // Also strip <box> tags accidentally placed inside a choice line.
  processedContent = processedContent.replace(
    /^([①-⑩][^\n]*?)<box>[ \t]*/gm,
    '$1'
  );
  // Re-balance: if there are unmatched <box>/</box> after cleanup, drop the extras.
  {
    const openCount = (processedContent.match(/<box>/g) || []).length;
    const closeCount = (processedContent.match(/<\/box>/g) || []).length;
    if (closeCount > openCount) {
      let extras = closeCount - openCount;
      processedContent = processedContent.replace(/<\/box>/g, (m) => (extras-- > 0 ? '' : m));
    } else if (openCount > closeCount) {
      let extras = openCount - closeCount;
      processedContent = processedContent.replace(/<box>/g, (m) => (extras-- > 0 ? '' : m));
    }
    processedContent = processedContent.replace(/\n{3,}/g, '\n\n');
  }

  // Remove "문제:" text for order questions
  if (isOrderQuestion) {
    processedContent = processedContent.replace(/문제:\s*\n?/g, '');
  }

  // Check if this is a grammar question
  const isGrammarQuestion = (questionType === 'grammar' || displayContent.includes('다음 중 어법상 적절하지 않은 것은?')) && questionType !== 'grammarCorrection' && questionType !== 'grammarCorrectionUnderline';

  // For grammarCorrectionUnderline: convert [[text]] to <u>text</u> for underline rendering
  if (questionType === 'grammarCorrectionUnderline') {
    processedContent = processedContent.replace(/\[\[([^\]]+?)\]\]/g, '<u>$1</u>');
    // Also remove any stray <b> tags the AI might output
    processedContent = processedContent.replace(/<\/?b>/g, '');
  }

  // For seongnamComplex: strip stray <u> tags (markers ⓐ~ⓕ are the visual cue, not underlines)
  if (questionType === 'seongnamComplex') {
    processedContent = processedContent.replace(/<\/?u>/g, '');
    processedContent = processedContent.replace(/\*\*/g, '');
  }

  // For vocabularyThreeBlanks and grammarSelection: bold the [선택지1 / 선택지2] patterns
  if (questionType === 'vocabularyThreeBlanks' || questionType === 'grammarSelection') {
    processedContent = processedContent.replace(
      /\(([ABC])\)\s*\[([^\]]+)\]/g,
      (_, letter, choices) => `(${letter}) <b>[${choices}]</b>`
    );
  }

  // For orderWritingKorean: bold the [Korean translation] parts in the passage
  // For orderWriting: bold the [scrambled words] parts in the passage
  if (questionType === 'orderWritingKorean' || questionType === 'orderWriting') {
    processedContent = processedContent.replace(
      /\[([^\]]{10,})\]/g,
      (match, content) => `<b>[${content}]</b>`
    );
  }

  // Convert <요약문> section into box
  processedContent = processedContent.replace(
    /(<요약문>)\n([\s\S]*?)(?=\n\s*<조건>|\n\s*<보기>|\n\s*\[정답\]|\n\s*$)/g,
    (match) => `\n<box>${match.trim()}</box>\n`
  );

  // Convert <조건> section into box (only when it starts on its own line, not inline in title text)
  processedContent = processedContent.replace(
    /\n(<조건>)\n([\s\S]*?)(?=\n\s*<보기>)/g,
    (match) => `\n<box>${match.trim()}</box>\n`
  );
  // Convert standalone <조건> into box (when no <보기> follows)
  if (!processedContent.includes('<box><조건>')) {
    processedContent = processedContent.replace(
      /\n(<조건>)\n([\s\S]*?)(?=\n\s*\[정답\]|\n\s*$)/g,
      (match) => `\n<box>${match.trim()}</box>\n`
    );
  }

  // Convert [조건] (square bracket format) into box
  if (!processedContent.includes('<box>[조건]')) {
    processedContent = processedContent.replace(
      /\n(\[조건\])\n([\s\S]*?)(?=\n\s*\[정답\]|\n\s*\[해설\]|\n\s*$)/g,
      (match) => `\n<box>${match.trim()}</box>\n`
    );
  }

  // Convert <보기1> section (dictionary type — word list) into box
  processedContent = processedContent.replace(
    /\n(<보기\s*1>)\n([\s\S]*?)(?=\n\s*<보기\s*2>|\n\s*\[정답\]|\n\s*$)/g,
    (match) => `\n<box>${match.trim()}</box>\n`
  );
  // Convert <보기2> section (dictionary type — definitions list) into box
  processedContent = processedContent.replace(
    /\n(<보기\s*2>)\n([\s\S]*?)(?=\n\s*[①-⑤]|\n\s*\[정답\]|\n\s*$)/g,
    (match) => `\n<box>${match.trim()}</box>\n`
  );

  // Convert collocation-style <보기> (inline word pair on same line, followed by word list) into box
  // Format: "<보기> word - word\n\nword - word\nword - word\n...\n① ... ⑤ ..."
  processedContent = processedContent.replace(
    /\n(<보기>\s+[^\n]+\n[\s\S]*?)(?=\n\s*①\s*\d)/g,
    (match) => `\n<box>${match.trim()}</box>\n`
  );

  // Convert <보기> that appears as a standalone section header (on its own line or starting a line)
  processedContent = processedContent.replace(
    /\n(<보기>)\n([\s\S]*?)(?=\n\s*\(A\)\s*＿)/g,
    (match) => `\n<box>${match.trim()}</box>\n`
  );
  // Convert <보기> section containing (A)/(B) blanks into box (e.g., summaryVocab)
  if (!processedContent.includes('<box><보기>')) {
    processedContent = processedContent.replace(
      /\n(<보기>)\n([\s\S]*?\([AB]\)\s*_+[\s\S]*?)(?=\n\s*\[정답\]|\n\s*$)/g,
      (match) => `\n<box>${match.trim()}</box>\n`
    );
  }
  // Convert standalone <보기> with word lists into box
  if (!processedContent.includes('<box><보기>')) {
    processedContent = processedContent.replace(
      /\n(<보기>)\n([\s\S]*?)(?=\n\s*\[정답\]|\n\s*$)/g,
      (match) => `\n<box>${match.trim()}</box>\n`
    );
  }

  // Convert <보기> section with a.~j. items into box (e.g., danggokUnanswerable)
  processedContent = processedContent.replace(
    /\n(<보기>)\n([\s\S]*?[a-j]\.\s[\s\S]*?)(?=\n\s*\[정답\]|\n\s*$)/g,
    (match) => `\n<box>${match.trim()}</box>\n`
  );

  // Convert standalone 보기 section (with ⓐ~ⓗ items) into box for content match questions
  processedContent = processedContent.replace(
    /\n보기\n([\s\S]*?[ⓐ-ⓗ][\s\S]*?)(?=\n\s*[①-⑤])/g,
    (match) => `\n<box>${match.trim()}</box>\n`
  );

  // Convert ⓐ~ⓔ/ⓐ~ⓗ item blocks (without 보기 header) into box for content match multiple answer questions
  if (!processedContent.includes('보기')) {
    processedContent = processedContent.replace(
      /\n(ⓐ\s[\s\S]*?ⓔ\s[^\n]*)(?=\n\s*\n?\s*[①-⑤])/g,
      (match) => `\n<box>${match.trim()}</box>\n`
    );
  }

  // Convert Q) question line into box for seongnamQnA questions
  processedContent = processedContent.replace(
    /\n(Q\)\s[^\n]+)/g,
    (match) => `\n<box>${match.trim()}</box>`
  );

  // Convert (가) and (나) paragraph blocks into boxes for seongnamHumanities questions
  processedContent = processedContent.replace(
    /\n\(가\)\n([\s\S]*?)(?=\n\(나\))/g,
    (match) => `\n(가)\n<box>${match.replace(/^\n\(가\)\n/, '').trim()}</box>\n`
  );
  processedContent = processedContent.replace(
    /\n\(나\)\n([\s\S]*?)(?=\n\s*[①-⑤])/g,
    (match) => `\n(나)\n<box>${match.replace(/^\n\(나\)\n/, '').trim()}</box>\n`
  );

  if (isInsertQuestion || questionType === 'grammarCorrection') {
    // Remove all underline formatting for insert and grammar correction questions
    processedContent = processedContent
      .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove ** formatting
      .replace(/<u>(.*?)<\/u>/g, '$1');  // Remove <u> tags if any
  } else {
    // For all other question types: apply underlines to question part only, remove from answer/explanation
    const parts = processedContent.split(/(\[정답\])/);
    if (parts.length > 1) {
      if (isSummaryQuestion) {
        parts[0] = formatSummaryQuestionBlanks(parts[0]);
      }

      // Apply underlines to question part only (before [정답])
      if (isGrammarQuestion) {
        // For grammar questions: Keep <u> tags for underlines, clean Korean titles only
        const questionPart = parts[0];
        const lines = questionPart.split('\n');
        const processedLines = lines.map(line => {
          // If line contains only Korean title patterns (no English text), don't process underlines
          if ((line.includes('다음 중 어법상 적절하지 않은 것은?') || 
               line.includes('다음 중 어법 상 적절하지 않은 것은?') ||
               line.includes('다음 글의 밑줄 친 부분 중, 어법상 틀린 것은?') ||
               line.includes('다음 글의 밑줄 친 부분 중, 어법상 맞는 것은?')) &&
              !line.match(/[A-Za-z]/)) {
            return line.replace(/\*\*(.*?)\*\*/g, '$1').replace(/[.,](?=\s*$)/g, '');
          }
          // For English text, convert any remaining ** to <u> but preserve existing <u> tags
          // Only convert ** if not already in <u> tags
          if (!line.includes('<u>')) {
            return convertAsteriskToUnderline(line);
          }
          return line; // Keep line as-is if it already has <u> tags
        });
        parts[0] = processedLines.join('\n');
        
        // Remove empty lines after grammar question titles
        parts[0] = parts[0]
          .replace(/(다음 중 어법상 적절하지 않은 것은\?)\n\n+/g, '$1\n')
          .replace(/(다음 중 어법 상 적절하지 않은 것은\?)\n\n+/g, '$1\n')
          .replace(/(다음 글의 밑줄 친 부분 중, 어법상 틀린 것은\?)\n\n+/g, '$1\n')
          .replace(/(다음 글의 밑줄 친 부분 중, 어법상 맞는 것은\?)\n\n+/g, '$1\n');
      } else {
        parts[0] = convertAsteriskToUnderline(parts[0]);
      }
      
      // Remove underlines and any asterisks from answer/explanation parts (after [정답])
      // Also clean possible bold markers spanning across the [정답] boundary
      // Trim trailing asterisks before [정답]
      parts[0] = parts[0].replace(/\*+$/g, '');
      // If there is content right after [정답], trim leading asterisks
      if (parts[2]) parts[2] = parts[2].replace(/^\*+\s*/g, '');

      for (let i = 1; i < parts.length; i++) {
        parts[i] = parts[i]
          .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove ** formatting
          .replace(/<u>(.*?)<\/u>/g, '$1')    // Remove <u> tags if any
          .replace(/\[\[([^\]]+?)\]\]/g, '$1') // Remove [[]] markers
          .replace(/\*/g, '')                 // Remove any remaining asterisks
          .replace(/\s*(\[정답\]|\[해설\])\s*/g, ' $1 '); // Normalize labels spacing
      }
      processedContent = parts.join('');
    } else {
      // If no [정답] section found, apply underlines to all content
      if (isSummaryQuestion) {
        processedContent = formatSummaryQuestionBlanks(processedContent);
      }

      if (isGrammarQuestion) {
        const lines = processedContent.split('\n');
        const processedLines = lines.map(line => {
          // If line contains Korean title patterns, remove underlines
          if (line.includes('다음 중 어법상 적절하지 않은 것은?') || 
              line.includes('다음 중 어법 상 적절하지 않은 것은?') ||
              line.match(/^[①-⑤]/)) {
            return line.replace(/\*\*(.*?)\*\*/g, '$1').replace(/[.,](?=\s*$)/g, '');
          }
          // For main text content, convert asterisks to underlines
          return convertAsteriskToUnderline(line);
        });
        processedContent = processedLines.join('\n');
      } else {
        processedContent = convertAsteriskToUnderline(processedContent);
      }
    }
  }

  // Handle insert question - add border to given sentence
  if (isInsertQuestion) {
    const lines = processedContent.split('\n');
    let foundGivenSentence = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const isGivenSentence = !foundGivenSentence && 
        !line.includes('글의 흐름으로 보아') && 
        !line.includes('가장 적절한 곳을 고르시오') &&
        !line.match(/^\s*\(\s*[①-⑤]\s*\)/) &&
        line.length > 10 &&
        !line.includes('[정답]') &&
        !line.includes('[해설]');
      
      if (isGivenSentence) {
        lines[i] = `<box>${line}</box>`;
        foundGivenSentence = true;
      }
    }
    
    processedContent = lines.join('\n');
  }

  // Handle order question - add border to first fixed sentence
  if (isOrderQuestion) {
    const lines = processedContent.split('\n');
    let foundFirstSentence = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      // Look for the first sentence after the question instruction
      if (!foundFirstSentence && 
          !line.includes('주어진 글 다음에 이어질 글의 순서로') &&
          !line.includes('다음 글의 순서로') &&
          !line.includes('가장 적절한 것을 고르시오') &&
          !line.match(/^\s*\([A-C]\)/) &&
          !line.match(/^\s*[①-⑤]/) &&
          !line.includes('[정답]') &&
          !line.includes('[해설]') &&
          line.length > 10) {
        lines[i] = `<box>${line}</box>`;
        foundFirstSentence = true;
      }
    }
    
    processedContent = lines.join('\n');
  }

  // Handle summary question - add border to summary sentence
  if (isSummaryQuestion) {
    const lines = processedContent.split('\n');
    let inOriginalText = false;
    let foundSummary = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip the question instruction line
      if (line.includes('다음 글의 내용을 한 문장으로 요약하고자 한다')) {
        continue;
      }
      
      // Detect when original text ends (empty line or options start)
      if (!foundSummary) {
        // Check if this is the summary sentence (contains (A) and (B) blanks)
        if (line.includes('(A)') && line.includes('(B)') && 
            !line.match(/^\s*[①-⑤]/) &&
            !line.includes('[정답]') &&
            !line.includes('[해설]')) {
          lines[i] = `<box>${line}</box>`;
          foundSummary = true;
        }
      }
    }
    
    processedContent = lines.join('\n');
  }

  // Fix **[정답]** format to [정답]
  processedContent = processedContent.replace(/\*\*\[정답\]\*\*/g, '[정답]');

  // Remove score markers like [3점], [4.3점], [4점] etc.
  processedContent = processedContent.replace(/\s*\[\d+(?:\.\d+)?점\]/g, '');

  // For title questions: strip surrounding quotes from choice lines (①~⑤)
  if (questionType === 'title') {
    processedContent = processedContent.replace(
      /^([①-⑩]\s*)["'“”‘’](.+?)["'“”‘’]\s*$/gm,
      '$1$2'
    );
  }

  // Final safety: remove any stray <box>/</box> tags that ended up on a choice line (①~⑩)
  processedContent = processedContent.replace(/([①-⑩][^\n]*?)<\/?box>/g, '$1');
  // Collapse blank lines that may remain between consecutive choice lines
  processedContent = processedContent.replace(/^([①-⑩][^\n]*)\n[ \t]*\n+(?=[①-⑩])/gm, '$1\n');

  // Split content into question and answer parts
  const parts = processedContent.split(/(\[정답\])/);
  let questionPart = parts[0];
  // Remove "===== 정답 및 해설 =====" separator from question part
  questionPart = questionPart.replace(/={3,}\s*정답\s*(및|&)\s*해설\s*={3,}/g, '').trimEnd();
  let answerPart = parts.length > 1 ? parts.slice(1).join('') : '';

  // For combinedQuestion / danggokListening: split question area from the consolidated
  // answer/explanation block at the "===== 정답 및 해설 =====" separator so that the
  // answer section renders separately, just like other question types.
  if (questionType === 'combinedQuestion' || questionType === 'danggokListening') {
    const splitRegex = /={3,}\s*정답\s*(?:및|&)\s*해설\s*={3,}/;
    const m = processedContent.match(splitRegex);
    if (m && m.index !== undefined) {
      questionPart = processedContent.slice(0, m.index).trimEnd();
      answerPart = processedContent.slice(m.index + m[0].length).trimStart();
    } else {
      // Fallback: keep the legacy single-block behavior if separator is missing.
      questionPart = processedContent.replace(splitRegex, '').trimEnd();
      answerPart = '';
    }
    // Safety: strip any stray per-question numbering like "14.", "15." that the AI may emit
    // at the start of a line (we render multiple questions under one shared number).
    questionPart = questionPart.replace(/^[ \t]*\d{1,2}\.\s+/gm, '');
    answerPart = answerPart.replace(/^[ \t]*\d{1,2}\.\s+/gm, '');

    // Format spacing for combined questions:
    // - Remove blank line(s) between a question instruction (ending with ?) and its first choice (①)
    // - Ensure a single blank line BEFORE each question instruction line
    questionPart = questionPart.replace(/(\?\s*)\n[ \t]*\n+(?=[①-⑤])/g, '$1\n');
    // Collapse 2+ consecutive blank lines into one
    questionPart = questionPart.replace(/\n{3,}/g, '\n\n');
    // Ensure blank line before instruction lines (lines ending with "?") that aren't the first line
    questionPart = questionPart.replace(/([^\n])\n([^\n①-⑤\n][^\n]*\?\s*)$/gm, '$1\n\n$2');
  }


  // For 서답형 question types, strip [해설] section (show answer only)
  const seodapTypes = ['orderWritingKorean', 'orderWriting', 'summaryBlank', 'summaryVocab', 'summaryBlankWriting', 'topicWriting', 'blankWriting', 'grammarCorrection', 'grammarCorrectionUnderline', 'conditionWriting'];
  if (seodapTypes.includes(questionType)) {
    answerPart = answerPart.replace(/\[해설\][\s\S]*$/, '').trimEnd();
  }

  // Render content that may contain markdown tables
  const renderWithTable = (text: string) => {
    const lines = text.split('\n');
    const segments: React.ReactNode[] = [];
    let currentText: string[] = [];
    let tableRows: string[][] = [];
    let inTable = false;

    const flushText = () => {
      if (currentText.length > 0) {
        const t = currentText.join('\n');
        segments.push(<TextWithUnderline key={`t-${segments.length}`} text={t} />);
        currentText = [];
      }
    };

    const flushTable = () => {
      if (tableRows.length > 0) {
        // Filter out separator rows (|---|---|)
        const dataRows = tableRows.filter(row => !row.every(cell => /^-+$/.test(cell.trim())));
        if (dataRows.length > 0) {
          const headerRow = dataRows[0];
          const bodyRows = dataRows.slice(1);
          segments.push(
            <div key={`tbl-${segments.length}`} className="my-3 overflow-x-auto whitespace-normal">
              <table className="w-full border-collapse border border-slate-300 text-sm table-fixed">
                <thead>
                  <tr className="bg-slate-100">
                    {headerRow.map((cell, i) => (
                      <th
                        key={i}
                        className={`border border-slate-300 px-3 py-2 text-left font-semibold text-foreground ${i === 0 && !cell.trim() ? 'w-10 text-center px-1' : ''}`}
                      >
                        {cell.trim()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bodyRows.map((row, ri) => (
                    <tr key={ri} className={ri % 2 === 1 ? 'bg-slate-50/50' : ''}>
                      {row.map((cell, ci) => (
                        <td
                          key={ci}
                          className={`border border-slate-300 px-3 py-2 text-foreground ${ci === 0 && !headerRow[0]?.trim() ? 'w-10 text-center px-1 font-semibold' : ''}`}
                          style={{ minHeight: cell.trim() ? 'auto' : '28px' }}
                        >
                          {cell.trim().includes('(A)') ? (
                            <span className="font-semibold text-foreground">{cell.trim()}</span>
                          ) : (cell.trim() || '\u00A0')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        tableRows = [];
      }
    };

    for (const line of lines) {
      const trimmed = line.trim();
      if (/^\|.*\|$/.test(trimmed)) {
        if (!inTable) {
          flushText();
          inTable = true;
        }
        const cells = trimmed.slice(1, -1).split('|');
        tableRows.push(cells);
      } else {
        if (inTable) {
          flushTable();
          inTable = false;
        }
        currentText.push(line);
      }
    }
    if (inTable) flushTable();
    flushText();

    return <>{segments}</>;
  };

  // Display original output as-is with underline support
  return (
    <div className="relative group">
      <RefreshButton />
      <div className="rounded-2xl overflow-hidden shadow-[0_8px_40px_-12px_rgba(0,0,0,0.12)] border border-slate-200/60 mx-0 transition-all duration-500 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.18)] hover:border-slate-300/80">
        {/* Question Section */}
        <div className="relative bg-white p-7">
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.03),transparent_50%)]" />
          
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                {/* Question label with number */}
                <h3 className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent">
                  문제{questionNumber}
                </h3>
                
                {/* Separator */}
                <div className="w-px h-5 bg-gradient-to-b from-transparent via-slate-300 to-transparent" />
                
                {/* Question type badge */}
                {getQuestionTypeName(questionType) && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium text-slate-600 bg-slate-100/80 rounded-lg border border-slate-200/60">
                    {getSchoolLogo(questionType) && (
                      <img 
                        src={getSchoolLogo(questionType)!} 
                        alt="" 
                        className="h-4 w-4 object-contain"
                      />
                    )}
                    <span className="tracking-wide">{getQuestionTypeName(questionType)}</span>
                  </span>
                )}
              </div>
            </div>
            
            <div className="whitespace-pre-wrap text-slate-700 leading-[1.85] text-[15px] pl-1">
              {isTableQuestion ? renderWithTable(questionPart) : <TextWithUnderline text={questionPart} />}
            </div>
          </div>
        </div>
        
        {/* Answer Section */}
        {answerPart && (
          <div className="relative">
            {/* Premium Divider */}
            <div className="relative h-16 bg-gradient-to-b from-white via-slate-50 to-emerald-50/30">
              {/* Decorative line */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-8">
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-emerald-300/60 to-transparent" />
                  </div>
                  
                  {/* Center badge */}
                  <div className="relative flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 rounded-full border border-emerald-200/60 shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-sm shadow-emerald-500/30" />
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
                      정답 · 해설
                    </span>
                    <div className="w-2 h-2 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-sm shadow-emerald-500/30" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Answer content */}
            <div className="relative bg-gradient-to-br from-emerald-50/80 via-green-50/50 to-teal-50/40 p-7">
              {/* Decorative corner accents */}
              <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-emerald-100/50 to-transparent rounded-br-3xl" />
              <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-teal-100/50 to-transparent rounded-tl-3xl" />
              
              {/* Side accent line */}
              <div className="absolute left-0 top-6 bottom-6 w-1 bg-gradient-to-b from-emerald-400 via-green-400 to-teal-400 rounded-r-full shadow-sm shadow-emerald-500/20" />
              
              <div className="relative pl-5">
                <div className="whitespace-pre-wrap text-slate-700 leading-[1.85] text-[15px]">
                  <TextWithUnderline text={answerPart} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
